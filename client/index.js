import 'babel-polyfill'

import './index.css'

import React, { Fragment } from 'react'
import ReactDom from 'react-dom'

import App from './App'


ReactDom.render((
  <div className="App">
    <App />
  </div>
), document.getElementById('root'))
