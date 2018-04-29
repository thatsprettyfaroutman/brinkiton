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
import TEXTURE_ROUND from './doggo.svg'
import TEXTURE_WALRUS from './doggo3.svg'
import TEXTURE_ANOTHER_ROUND from './doggo4.svg'
import TEXTURE_UNTO_RECCU from './doggo5.svg'


const roundReccu = {
  meshWidth: 121,
  meshHeight: 125,
  offsetX: -5,
  offsetY: 0,
  radius: 28,
  velocityY: -15,
  mass: 30,
  type: 'circle',
  material: new MeshBasicMaterial({
    map: new TextureLoader().load(TEXTURE_ROUND),
    transparent: true,
  })
}

const walrusReccu = {
  meshWidth: 236,
  meshHeight: 112,
  offsetX: 5,
  offsetY: 0,
  width: 100,
  height: 50,
  velocityY: -30,
  mass: 10000,
  type: 'rectangle',
  material: new MeshBasicMaterial({
    map: new TextureLoader().load(TEXTURE_WALRUS),
    transparent: true,
  })
}

const anotherRoundReccu = {
  meshWidth: 118,
  meshHeight: 119,
  offsetX: 0,
  offsetY: 0,
  radius: 28,
  velocityY: -15,
  mass: 30,
  type: 'circle',
  material: new MeshBasicMaterial({
    map: new TextureLoader().load(TEXTURE_ANOTHER_ROUND),
    transparent: true,
  })
}

const untoReccu = {
  meshWidth: 80,
  meshHeight: 152,
  offsetX: 10,
  offsetY: 0,
  width: 25,
  height: 76,
  velocityY: -15,
  mass: 100,
  type: 'rectangle',
  material: new MeshBasicMaterial({
    map: new TextureLoader().load(TEXTURE_UNTO_RECCU),
    transparent: true,
  })
}



class Reccu extends Entity {
  constructor(x = 0, y = 0) {
    super()


    let reccu = roundReccu
    if (Math.random() > 0.5) reccu = untoReccu
    if (Math.random() > 0.8) reccu = anotherRoundReccu
    if (Math.random() > 0.98) reccu = walrusReccu

    const angle =  (Math.random() - 0.5) * Math.PI
    // const scale = [0.5, 1][Math.floor(Math.random() * 2)]
    const scale = 1

    let matter
    if (reccu.type === 'circle') {
      matter = Bodies.circle(x, y, reccu.radius * scale)
      this._matterRadius = reccu.radius * scale
    } else {
      matter = Bodies.rectangle(
        x, y,
        reccu.width * scale, reccu.height * scale
      )
      this._matterWidth = reccu.width * scale
      this._matterHeight = reccu.height * scale
    }

    matter.restitution = 0.5
    setTimeout(() => {
      if (matter) {
        matter.restitution = 0
        Body.set(matter, { isStatic: true })
      }
    }, 10000)
    Body.rotate(matter, angle)
    Body.setAngularVelocity( matter, angle / 10 )
    Body.setVelocity( matter, {
      x: Math.random() * 10 - 5,
      y: reccu.velocityY,
    })
    Body.setMass(matter, reccu.mass * scale)
    this._matter = matter

    this._meshWidth = reccu.meshWidth * scale
    this._meshHeight = reccu.meshHeight * scale
    this.createMesh(reccu.material)
    this._mesh.position.x = reccu.offsetX * scale
    this._mesh.position.y = reccu.offsetY * scale

    // this.drawMatter()

  }

}




export default Reccu
