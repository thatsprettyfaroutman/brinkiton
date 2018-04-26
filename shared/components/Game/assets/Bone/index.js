import {
  Bodies,
  Body,
  Vector,
} from 'matter-js'

import Entity from '../Entity'




class Bone extends Entity {

  constructor(fromV, toV) {
    super()

    const angle = Vector.angle(fromV, toV)
    const matter = Bodies.rectangle(fromV.x, fromV.y, 10, 30)

    const angularVelocity = toV.x > window.innerWidth / 2 ?
      Math.random() / 2 :
      Math.random() / -2

    Body.rotate(matter, angle)
    Body.setAngularVelocity( matter, angularVelocity )
    Body.setVelocity( matter, {
      x: Math.cos(angle) * 10 + Math.random() * 2 - 1,
      y: Math.sin(angle) * 10 + Math.random() * 2 - 1,
    })
    this._matter = matter
  }

}




export default Bone
