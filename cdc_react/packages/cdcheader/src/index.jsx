import React from 'react'
import ReactDOM from 'react-dom/client'

import CDCHeader from './CDCHeader'

import './scss/main.scss'

window.location.href.includes('editor=true')

let domContainer = document.getElementsByClassName('react-container')[0]

ReactDOM.createRoot(domContainer).render(
  <React.StrictMode>
    <div id='react-container'>
      <div id='main-area'>
        <CDCHeader />
      </div>
    </div>
  </React.StrictMode>
)
