import './index.css'

import React, { Component } from 'react'
import {
  Engine,
  Render,
  World,
  Bodies,
  Body,
  SAT,
  Composite,
  Vector,
  Events,
  Runner,
} from 'matter-js'
import raf from 'raf'
import {
  OrthographicCamera,
  Scene,
  WebGLRenderer,
  Color,
  BoxGeometry,
  MeshBasicMaterial,
  Mesh,
  Raycaster,
  Vector2,
  Vector3,
} from 'three'
import Stats from 'stats.js'


import Reccu from './assets/Reccu'
import Bone from './assets/Bone'
import Wall from './assets/Wall'

import {
  GAME_WIDTH,
  GAME_HEIGHT,
} from './config'

const GAME_STATE_RUNNING = 'GAME_STATE_RUNNING'
const GAME_STATE_PAUSED = 'GAME_STATE_PAUSED'

class Game extends Component {
  gameState = GAME_STATE_PAUSED

  ref = null
  debugRef = null
  threeRef = null
  scoreRef = null
  overlayRef = null

  lastUpdate = Date.now()

  matterEngine = null
  matterRender = null

  reccus = []
  bones = []
  walls = []

  reccuSpawnInterval = 1000

  stats = null

  difficultyInterval = null
  difficulty = 1000

  mouse = {}
  mouseHelper = null

  score = 0

  componentDidMount() {
    this.initMatter()
    this.initThree()
    this.initLevel()

    setTimeout(() => {
      this.restartGame()
    }, 4000)
  }

  componentWillUnmount() {
    this.stopGame()
  }

  initMatter() {
    this.matterEngine = Engine.create()
    Engine.run(this.matterEngine)
    this.matterRender = Render.create({
      element: this.debugRef,
      engine: this.matterEngine,
      options: {
        width: GAME_WIDTH,
        height: GAME_HEIGHT * 1.2,
      },
    })
  }

  initThree() {
    const aspect = GAME_WIDTH / GAME_HEIGHT
    const frustumSize = GAME_HEIGHT * 2

    this.score = 0
    this.running = true
    this.difficulty = 1000
    this.stats = new Stats()
    this.asteroidI = 0

    this.mouse = {
      raycaster: new Raycaster(),
      vector2: new Vector2(0, 0),
      position: new Vector3(0, 0, 0),
    }

    this.camera = new OrthographicCamera(frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, 1, 2000)
    this.camera.position.z = 10

    this.scene = new Scene()
    this.scene.add(this.camera)

    this.mouseHelper = new Mesh(
      new BoxGeometry(50, 50, 50),
      new MeshBasicMaterial({
        wireframe: true,
        color: 0xff00ff
      })
    )
    this.scene.add(this.mouseHelper)

    this.renderer = new WebGLRenderer({
      antialias: false,
      alpha: true,
    })
    this.renderer.setSize(GAME_WIDTH * 2, GAME_HEIGHT * 2)
    this.threeRef = this.renderer.domElement
    this.ref.appendChild(this.renderer.domElement)

    this.stats.showPanel(0)
    this.debugRef.appendChild( this.stats.dom );
  }

  initLevel() {
    const ground = new Wall(GAME_WIDTH / 2, GAME_HEIGHT * 1.2, Math.PI / 2)
    const wallLeft = new Wall(-16, GAME_HEIGHT / 2)
    const wallRight = new Wall(GAME_WIDTH + 15, GAME_HEIGHT / 2)
    this.walls = [ground, wallLeft, wallRight]

    // add all of the bodies to the world
    World.add(this.matterEngine.world, this.walls.map(x => x.getMatter()))
    this.walls.forEach(x => this.scene.add(x))
  }

  restartGame() {
    this.gameState = GAME_STATE_RUNNING
    this.clearAssets()
    this.renderLoop()
    Engine.clear(this.matterEngine)
    Render.run(this.matterRender)
    Events.on(this.matterEngine, 'afterUpdate', this.handleEngineUpdate)
    this.resetScore()
    this.reccuSpawnInterval = 1000
    this.difficultyInterval = setInterval(() => {
      this.reccuSpawnInterval /= 1.05
      if (this.reccuSpawnInterval < 100) this.reccuSpawnInterval = 100
    }, 2000)
    this.reccuSpawnLoop()
  }

  stopGame() {
    this.gameState = GAME_STATE_PAUSED
    Render.stop(this.matterRender)
    Events.off(this.matterEngine, 'afterUpdate', this.handleEngineUpdate)
    clearInterval(this.difficultyInterval)
  }

  clearAssets = () => {
    const { bones, reccus } = this

    bones.forEach(bone => {
      Composite.remove(this.matterEngine.world, [bone.getMatter()])
      this.scene.remove(bone)
    })

    reccus.forEach(reccu => {
      Composite.remove(this.matterEngine.world, [reccu.getMatter()])
      this.scene.remove(reccu)
    })

    this.bones = []
    this.reccus = []
  }

  handleEngineUpdate = () => {
    const { bones, reccus, walls } = this
    const now = Date.now()
    const deltaTime = now - this.lastUpdate
    this.lastUpdate = now

    bones.forEach(bone => bone.renderUpdate(deltaTime))
    reccus.forEach(reccu => reccu.renderUpdate(deltaTime))
    walls.forEach(wall => wall.renderUpdate(deltaTime))

    bones.forEach(bone => {
      reccus
        .forEach(reccu => {
          if (SAT.collides(bone.getMatter(), reccu.getMatter()).collided) {
            this.handleBoneHitReccu(bone, reccu)
          }
        })
    })

    const gameOver = reccus.filter(reccu => {
      return GAME_HEIGHT - reccu.getMatter().position.y > 400
    }).length > 10
    if ( gameOver ) this.handleGameOver()

    this.mouseHelper.position.x = this.mouse.position.x
    this.mouseHelper.position.y = this.mouse.position.y
    this.mouseHelper.position.z = this.mouse.position.z

    this.bones = this.bones.filter(bone => {
      if (bone.getLifeTime() < 0) {
        Composite.remove(this.matterEngine.world, [bone.getMatter()])
        this.scene.remove(bone)
        this.addScore(-33)
        return false
      }
      return true
    })
  }

  renderLoop = () => {
    if (this.gameState !== GAME_STATE_RUNNING) return
    this.stats.begin()
    this.renderer.render(this.scene, this.camera)
    this.stats.end()
    raf(this.renderLoop)
  }

  reccuSpawnLoop = () => {
    if (this.gameState !== GAME_STATE_RUNNING) return

    const x = [50, GAME_WIDTH - 50][Math.floor(Math.random() * 2)]
    const y = Math.min.apply(null, [
      ...this.reccus
        .filter( x => x.getMatter().speed < 0.5)
        .map( x => x.getMatter().position.y ),
      GAME_HEIGHT + 100
    ])

    const reccu = new Reccu(x, y)
    World.add( this.matterEngine.world, reccu.getMatter() )
    this.reccus.push(reccu)
    this.scene.add(reccu)
    setTimeout(this.reccuSpawnLoop, this.reccuSpawnInterval)

    this.addScore(11)
  }

  handleMouseMove = e => {
    const { clientX, clientY } = e
    if (!this.mouse) return false
    // const { top, left } = this.threeRef.getBoundingClientRect()
    this.mouse.position.x =
      clientX / window.innerWidth * GAME_WIDTH * 2 - GAME_WIDTH
    this.mouse.position.y =
     (0.5 - clientY / window.innerHeight) * GAME_HEIGHT * 2
  }

  handleThrowBone = e => {
    if (this.gameState !== GAME_STATE_RUNNING) return
    const x = e.clientX / window.innerWidth * GAME_WIDTH
    const y = e.clientY / window.innerHeight * GAME_HEIGHT

    const fromV = Vector.create(GAME_WIDTH / 2, GAME_HEIGHT - 400)
    const toV = Vector.create(x, y)
    const bone = new Bone(fromV, toV)
    this.bones.push(bone)
    World.add(this.matterEngine.world, [bone.getMatter()])
    this.scene.add(bone)
  }

  handleBoneHitReccu = (bone, reccu) => {
    console.log(`bone ${bone.id} hit reccu ${reccu.id}`)
    Composite.remove(this.matterEngine.world, [bone.getMatter(), reccu.getMatter()])
    this.scene.remove(bone)
    this.scene.remove(reccu)
    this.bones = this.bones.filter(x => x.id !== bone.id)
    this.reccus = this.reccus.filter(x => x.id !== reccu.id)
    this.addScore(88)
  }

  handleGameOver = () => {
    this.stopGame()
    if (this.overlayRef) {
      this.overlayRef.classList.add('Game__overlay--white')
      setTimeout(() => {
        this.overlayRef.classList.remove('Game__overlay--white')
      }, 400)
    }
    // alert(`you lose, score: ${ this.score }`)
    // this.restartGame()
  }

  addScore = amount => {
    this.score += amount
    if (this.scoreRef) this.scoreRef.innerHTML = this.score
  }

  resetScore = () => {
    this.score = 0
    if (this.scoreRef) this.scoreRef.innerHTML = this.score
  }

  render() {
    return (
      <div
        className="Game"
        ref={ ref => this.ref = ref }
        onClick={ this.handleThrowBone }
        onMouseMove={ this.handleMouseMove }
      >
        <div className="Game__background" />
        <div
          className="Game__debug"
          ref={ ref => this.debugRef = ref }
        />
        <div className="Game__overlay" ref={ ref => this.overlayRef = ref }>
          <div className="Game__score" ref={ ref => this.scoreRef = ref } />
        </div>
      </div>
    )
  }
}




export default Game
