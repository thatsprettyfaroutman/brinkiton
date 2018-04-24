import 'babel-polyfill'

import './index.css'

import React, { Fragment } from 'react'
import ReactDom from 'react-dom'

import Game from 'Shared/Game'


ReactDom.render((
  <div className="App">
    <Game />
  </div>
), document.getElementById('root'))
