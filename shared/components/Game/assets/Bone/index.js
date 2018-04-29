import {
  Bodies,
  Body,
  Vector,
} from 'matter-js'

import Entity from '../Entity'




class Bone extends Entity {
  _matterWidth = 10
  _matterHeight = 30
  _lifeTime = 3000

  constructor(fromV, toV) {
    super()

    const angle = Vector.angle(fromV, toV)
    const matter = Bodies.rectangle(fromV.x, fromV.y, this._matterWidth, this._matterHeight)

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

    this.drawMatter()
  }

}




export default Bone
