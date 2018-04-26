import {
  Bodies,
  Body,
} from 'matter-js'
import {
  TextureLoader,
  MeshBasicMaterial,
  Vector3,
} from 'three'
import random from 'lodash.random'
import Entity from '../Entity'
import TEXTURE from './doggo.png'

const material = new MeshBasicMaterial({
  map: new TextureLoader().load(TEXTURE),
  transparent: true,
})


class Reccu extends Entity {

  _meshWidth = 261
  _meshHeight = 311

  constructor(x = 0, y = 0) {
    super()

    const size = Math.random() > 0.5 ? 30 : 40
    const angle = (Math.random() - 0.5) * 6
    let matter

    if (Math.random() > 0.5) {
      matter = Bodies.rectangle(x, y, size, size * 2)
    } else {
      matter = Bodies.circle(x, y, size)
    }

    matter.restitution = 1
    Body.rotate(matter, angle)
    Body.setAngularVelocity( matter, angle / 10 )
    Body.setVelocity( matter, { x: Math.random() * 20 - 10, y: -15 })
    this._matter = matter

    this.createMesh(material)

  }

}




export default Reccu
