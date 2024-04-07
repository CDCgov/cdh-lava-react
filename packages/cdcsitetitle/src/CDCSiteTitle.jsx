import React, { useEffect, useCallback, useState, useRef } from 'react'
import axios from 'axios'
import parse from 'html-react-parser'
import { Markup } from 'interweave'

import ErrorBoundary from '@cdc/core/components/ErrorBoundary'

import Loading from '@cdc/core/components/Loading'

import ConfigContext from './ConfigContext'
import defaults from './data/initial-state'
import './scss/main.scss'

import './scss/main.scss'

import { publish } from '@cdc/core/helpers/events'

import useDataVizClasses from '@cdc/core/helpers/useDataVizClasses'

const CDCSiteTitle = ({ configUrl, config: configObj, isDashboard = false, isEditor = false, setConfig: setParentConfig }) => {
  // Default States
  const [config, setConfig] = useState({ ...defaults })
  const [loading, setLoading] = useState(true)
  // Custom States
  const [tagline, setTagLine] = useState('')
  const [link, setLink] = useState('')
  const [errorMessage, setErrorMessage] = useState(null)
  const [coveLoadedHasRan, setCoveLoadedHasRan] = useState(false)
  const container = useRef()

  const { innerContainerClasses, contentClasses } = useDataVizClasses(config)

  let { title } = config

  return (
    <div className='container-fluid site-title'>
      <div className='container'>
        <div className='row'>
          <div className='col'>
            <div className='display-6 text-white fw-500 py-1'>
              <a href={link}>{title}</a>
            </div>
            {tagline && <p className='tagline d-none d-md-inline-block'>{tagline}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CDCSiteTitle
