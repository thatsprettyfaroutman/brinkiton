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


class Game extends Component {
  ref = null
  engine = null
  reccus = []
  bones = []

  lastUpdateTime = Date.now()
  swayIterator = 0
  targetMs = 1000 / 60
  scale = 2
  stats = null

  asteroidI = 0

  updateLoopInterval = null
  asteroidInterval = null
  difficultyInterval = null
  difficulty = 1000

  mouse = {}

  mouseHelper = null
  space = null
  ship = null
  asteroids = []
  shots = []

  score = 0

  componentDidMount() {
    this.initMatter()
    this.initThree()
    this.updateLoop()
    this.reccuSpawnLoop()

    // Stop after minute or so
    setTimeout(() => {
      this.reccuSpawnLoop = () => {}
      this.updateLoop = () => {}
    }, 100000)
  }

  initMatter() {
    // create an engine
    this.engine = Engine.create()

    // create a renderer
    const render = Render.create({
        element: this.ref,
        engine: this.engine
    })

    // create two boxes and a ground
    const ground = Bodies.rectangle(400, 600, 1000, 30, { isStatic: true })
    const wallLeft = Bodies.rectangle(-16, 300, 30, 2000, { isStatic: true })
    const wallRight = Bodies.rectangle(815, 300, 30, 2000, { isStatic: true })

    const funnelLeft = Bodies.rectangle(100, 740, 30, 400, { isStatic: true })
    const funnelRight = Bodies.rectangle(700, 740, 30, 400, { isStatic: true })
    Body.rotate(funnelLeft, -0.7)
    Body.rotate(funnelRight, 0.7)


    // add all of the bodies to the world
    World.add(this.engine.world, [ground, wallLeft, wallRight, funnelLeft, funnelRight])

    // run the this.engine
    Engine.run(this.engine)

    // run the renderer
    Render.run(render)


  }

  initThree() {
    const aspect = window.innerWidth / window.innerHeight
    const frustumSize = window.innerHeight * 2

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
    this.scene.background = new Color( 0x130F40 )
    this.scene.add(this.camera)

    // const gridHelper = new GridHelper( window.innerWidth * 2, 20 )
    // gridHelper.rotation.x = Math.PI / 2
		// this.scene.add( gridHelper )

    // ASSETS
    this.mouseHelper = new Mesh(
      new BoxGeometry(50, 50, 50),
      new MeshBasicMaterial({
        wireframe: true,
        color: 0xff00ff
      })
    )
    this.scene.add(this.mouseHelper)
    //
    // this.ship = new Ship()
    // this.ship.position.y = -window.innerHeight / 2 * 2 + this.ship.getHeight()
    // this.ship.set('_mouse', this.mouse)
    // this.scene.add(this.ship)
    //
    // this.space = new Space()
    // this.scene.add(this.space)


    // Stuff

    this.renderer = new WebGLRenderer({ antialias: false })
    this.renderer.setSize(window.innerWidth * 2, window.innerHeight * 2)
    this.ref.appendChild(this.renderer.domElement)

    this.stats.showPanel(0)
    this.ref.appendChild( this.stats.dom );

    this.renderLoop()
    // this.updateLoopInterval = setInterval(this.updateLoop, this.targetMs)
    // this.difficultyInterval = setInterval(this.difficultyLoop, 10000)
    // this.asteroidInterval = setInterval(this.asteroidLoop, 500)
  }

  updateLoop = () => {
    const { bones, reccus } = this

    bones.forEach(bone => {
      reccus
        .forEach(reccu => {
          if (SAT.collides(bone.getMatter(), reccu.getMatter()).collided) {
            this.handleBoneHitReccu(bone, reccu)
          }
        })
    })

    this.mouseHelper.position.x = this.mouse.position.x
    this.mouseHelper.position.y = this.mouse.position.y
    this.mouseHelper.position.z = this.mouse.position.z


    setTimeout(this.updateLoop, 1000 / 30)
  }

  renderLoop = () => {
    const { bones, reccus } = this
    this.stats.begin()
    bones.forEach(bone => bone.renderUpdate())
    reccus.forEach(reccu => reccu.renderUpdate())
    this.renderer.render(this.scene, this.camera)
    this.stats.end()
    raf(this.renderLoop)
  }

  reccuSpawnLoop = () => {
    const reccu = new Reccu(400, 400)
    World.add( this.engine.world, reccu.getMatter() )
    this.reccus.push(reccu)
    this.scene.add(reccu)
    setTimeout(this.reccuSpawnLoop, 5000)
  }

  handleMouseMove = e => {
    const { clientX, clientY } = e
    const { innerWidth, innerHeight } = window
    this.mouse.vector2.x = ( clientX / innerWidth ) * 2 - 1
    this.mouse.vector2.y = - ( clientY / innerHeight ) * 2 + 1
    this.mouse.raycaster.setFromCamera(this.mouse.vector2, this.camera)
    const pos3 = this.mouse.raycaster.ray.origin
    this.mouse.position.x = pos3.x
    this.mouse.position.y = pos3.y
    this.mouse.position.z = pos3.z
  }

  handleThrowBone = e => {
    const fromV = Vector.create(400, 100)
    const toV = Vector.create(e.clientX, e.clientY)
    const bone = new Bone(fromV, toV)
    this.bones.push(bone)
    World.add(this.engine.world, [bone.getMatter()])
  }

  handleBoneHitReccu = (bone, reccu) => {
    console.log(`bone ${bone.id} hit reccu ${reccu.id}`)
    Composite.remove(this.engine.world, [bone.getMatter(), reccu.getMatter()])
    this.scene.remove(bone)
    this.scene.remove(reccu)
    this.bones = this.bones.filter(x => x.id !== bone.id)
    this.reccus = this.reccus.filter(x => x.id !== reccu.id)
  }


  render() {
    return (
      <div
        className="Game"
        ref={ ref => this.ref = ref }
        onClick={ this.handleThrowBone }
        onMouseMove={this.handleMouseMove}
      />
    )
  }
}




export default Game
