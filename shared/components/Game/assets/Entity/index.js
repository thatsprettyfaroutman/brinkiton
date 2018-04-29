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

import {
  GAME_WIDTH,
  GAME_HEIGHT,
} from '../../config'

export default class Entity extends Group {
  _hp = 1
  _lifeTime = 0
  _mesh = null
  _matter = null
  _matterMesh = null
  _meshWidth = 10
  _meshHeight = 10
  _matterWidth = 10
  _matterHeight = 10
  _matterRadius = 10

  set = (path, value) => {
    set(this, path, value)
    this.postSet(path, value)
  }

  getHp = () => this._hp
  getMatter = () => this._matter
  getLifeTime = () => this._lifeTime


  createMesh = material => {
    const geometry = new PlaneGeometry(
      this._meshWidth,
      this._meshHeight
    )
    this._mesh = new Mesh( geometry, material )
    this.add(this._mesh)
    this.renderUpdate()
  }

  drawMatter = (color=0xff00ff) => {
    const material = new MeshBasicMaterial({
      color,
      side: DoubleSide,
      wireframe: true,
    })

    let geometry
    if (this._matter.label === 'Circle Body') {
      geometry = new RingGeometry(this._matterRadius * 2, 0, 12)
    } else {
      geometry = new PlaneGeometry(this._matterWidth * 2, this._matterHeight * 2, 1)
    }

    const mesh = new Mesh(geometry, material)
    mesh.position.z = 1
    this.add(mesh)
  }

  renderUpdate = deltaTime => {
    this.position.x = this._matter.position.x * 2 - GAME_WIDTH
    this.position.y = GAME_HEIGHT - this._matter.position.y * 2
    this.rotation.z = -this._matter.angle
    this._lifeTime -= deltaTime
  }

  update = noop
  postSet = noop
}
