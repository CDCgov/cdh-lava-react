import React from 'react'
import ReactDOM from 'react-dom/client'

import { GlobalContextProvider } from '@cdc/core/components/GlobalContext'

import CDCSiteTitle from './CDCSiteTitle'

let isEditor = window.location.href.includes('editor=true')

let domContainer = document.getElementsByClassName('react-container')[0]

ReactDOM.createRoot(domContainer).render(
  <React.StrictMode>
    <GlobalContextProvider>
      <CDCSiteTitle configUrl={domContainer.attributes['data-config'].value} isEditor={isEditor} />
    </GlobalContextProvider>
  </React.StrictMode>
)
