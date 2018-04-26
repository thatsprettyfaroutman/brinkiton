import {
  Group,
  Vector3,
  MeshBasicMaterial,
  DoubleSide,
  RingGeometry,
  PlaneGeometry,
  Mesh,
} from 'three'

import noop from 'lodash.noop'
import set from 'lodash.set'

export default class Entity extends Group {
  _hp = 1
  _mesh = null
  _matter = null
  _meshWidth = 100
  _meshHeight = 100

  set = (path, value) => {
    set(this, path, value)
    this.postSet(path, value)
  }

  getHp = () => this._hp
  getMatter = () => this._matter


  createMesh = material => {
    const geometry = new PlaneGeometry(
      this._meshWidth,
      this._meshHeight
    )
    this._mesh = new Mesh( geometry, material )
    this.add(this._mesh)
  }

  drawMatter = (color=0xff00ff) => {
    // const ringMaterial = new MeshBasicMaterial({
    //   color,
    //   side: DoubleSide,
    // })
    // const ringGeometry = new RingGeometry(
    //   this._radius * this._size,
    //   (this._radius * this._size - 2),
    //   36 * 2
    // )
    // const ring = new Mesh(ringGeometry, ringMaterial)
    // ring.position.z = 1
    // this._ring = ring
    // this.add(ring)
  }

  renderUpdate = () => {
    this.position.x = (this._matter.position.x - 400) * 2
    this.position.y = (600 - this._matter.position.y) * 2
    this.rotation.z = this._matter.angle
  }

  update = noop
  postSet = noop
}
