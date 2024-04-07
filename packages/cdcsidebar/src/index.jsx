import React from 'react'
import ReactDOM from 'react-dom/client'

import { GlobalContextProvider } from '@cdc/core/components/GlobalContext'

import CDCSideBar from './CDCSideBar'

import './scss/main.scss'

let isEditor = window.location.href.includes('editor=true')

let domContainer = document.getElementsByClassName('react-container')[0]

ReactDOM.createRoot(domContainer).render(
  <React.StrictMode>
    <GlobalContextProvider>
      <CDCSideBar />
    </GlobalContextProvider>
  </React.StrictMode>
)
