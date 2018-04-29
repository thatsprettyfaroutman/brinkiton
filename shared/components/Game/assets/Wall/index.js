import {
  Bodies,
  Body,
} from 'matter-js'

import Entity from '../Entity'
import { GAME_HEIGHT } from '../../config'




class Wall extends Entity {
  _matterWidth = 30
  _matterHeight = GAME_HEIGHT * 2

  constructor(x = 0, y = 0, angle = 0) {
    super()

    const matter = Bodies.rectangle(
      x, y,
      this._matterWidth, this._matterHeight,
      { isStatic: true }
    )
    Body.rotate(matter, angle)

    this._matter = matter
    // this.drawMatter()
  }

}




export default Wall
