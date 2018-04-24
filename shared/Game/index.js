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


class Game extends Component {
  ref = null
  engine = null
  bones = []

  componentDidMount() {
    this.init()
  }

  init() {
    // create an engine
    this.engine = Engine.create()

    // create a renderer
    const render = Render.create({
        element: this.ref,
        engine: this.engine
    })

    // create two boxes and a ground
    const ground = Bodies.rectangle(400, 800, 1000, 30, { isStatic: true })
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


    this.spawnLoop()
    this.updateLoop()

    // Stop after minute
    setTimeout(() => {
      this.spawnLoop = () => {}
      this.updateLoop = () => {}
    }, 100000)
  }

  spawnLoop = () => {
    const scale = Math.random() * 0.5 + 0.5
    const rotation = (Math.random() - 0.5) * 6
    const x = 400 // Math.random() * 800
    const y = 650
    const size = 40

    let newBox

    if (Math.random() > 0.5) {
      newBox = Bodies.rectangle(x, y, size * scale, size * scale * 2)
    } else {
      newBox = Bodies.circle(x, y, size * scale)
    }

    newBox.restitution = 1
    Body.rotate(newBox, rotation)
    Body.setAngularVelocity( newBox, rotation / 10 )
    Body.setVelocity( newBox, { x: Math.random() * 20 - 10, y: -15 })

    World.add(this.engine.world, [newBox])
    setTimeout(this.spawnLoop, 1000)
  }

  updateLoop = () => {
    const bodies = Composite.allBodies(this.engine.world)
    const { bones } = this
    // const bodies = this.bones
    bones.forEach(bone => {
      bodies
        .filter(x => x._type !== 'bone')
        .filter(x => !x.isStatic)
        .forEach(body => {
          if (SAT.collides(bone, body).collided) {
            this.handleBoneHitBody(bone, body)
          }
        })
    })

    setTimeout(this.updateLoop, 1000 / 30)
  }


  handleThrowBone = e => {
    const v1 = Vector.create(400, 100)
    const v2 = Vector.create(e.clientX, e.clientY)
    const angle = Vector.angle(v1, v2)
    const bone = Bodies.rectangle(v1.x, v1.y, 10, 30)
    bone._type = 'bone'

    Body.rotate(bone, angle)
    Body.setAngularVelocity(bone, v2.x > 400 ? Math.random() / 2 : -Math.random() / 2)
    Body.setVelocity( bone, {
      x: Math.cos(angle) * 10,
      y: Math.sin(angle) * 10,
    })

    this.bones.push(bone)
    World.add(this.engine.world, [bone])
  }

  handleBoneHitBody = (bone, body) => {
    console.log(`bone ${bone.id} hit body ${body.id}`)
    Composite.remove(this.engine.world, [bone, body])
    this.bones = this.bones.filter(x => x.id !== bone.id)
  }


  render() {
    return (
      <div
        className="Game"
        ref={ ref => this.ref = ref }
        onClick={ this.handleThrowBone }
      />
    )
  }
}




export default Game
