import React, { useState } from 'react'
import { FaBars, FaHome, FaDatabase, FaCubes, FaProjectDiagram, FaChartBar, FaLock, FaGlobe, FaChevronUp } from 'react-icons/fa'
import { MdMenu, MdClose } from 'react-icons/md'
import { BrowserRouter as Router, NavLink } from 'react-router-dom'
import { Link } from 'react-router-dom'

const items = [
  { label: 'Home', icon: <FaHome style={{ color: '#FFFFFF', fill: '#FFFFFF' }} /> },
  { label: 'Data Sources', icon: <FaDatabase style={{ color: '#FFFFFF', fill: '#FFFFFF' }} /> },
  { label: 'Modules', icon: <FaCubes style={{ color: '#FFFFFF', fill: '#FFFFFF' }} /> },
  { label: 'Project', icon: <FaProjectDiagram style={{ color: '#FFFFFF', fill: '#FFFFFF' }} /> },
  { label: 'Dashboard', icon: <FaChartBar style={{ color: '#FFFFFF', fill: '#FFFFFF' }} /> },
  { label: 'Reports', icon: <FaChartBar style={{ color: '#FFFFFF', fill: '#FFFFFF' }} /> },
  { label: 'Public APIs', icon: <FaGlobe style={{ color: '#FFFFFF', fill: '#FFFFFF' }} /> },
  { label: 'Admin', icon: <FaLock style={{ color: '#FFFFFF', fill: '#FFFFFF' }} /> }
]

const CDCSideBar = () => {
  const [isCollapsed, setIsCollapsed] = useState(true)

  const toggleCollapsed = () => {
    setIsCollapsed(!isCollapsed)
  }

  const containerStyle = {
    backgroundColor: 'green',
    height: '100vh' // Set height to 100% of viewport height
    // or use '100%' if you want it to be 100% of parent element height
  }

  const iconStyle = {
    backgroundColor: 'transparent',
    color: '#f0f0f0',
    fill: '#f0f0f0',
    boxShadow: 'none',
    border: 'none',
    outline: 'none',
    fontFamily: 'Source Sans Pro Web, sans-serif',
    fontSize: '17.6px'
  }

  const labelStyle = {
    color: '#f0f0f0',
    fontFamily: 'Source Sans Pro Web, sans-serif',
    fontSize: '14.6px',
    whiteSpace: 'nowrap'
  }

  return (
    <Router>
      <div id='sidebar-container' className={`sidebar-${isCollapsed ? 'collapsed' : 'expanded'} bg-primary text-base-lightest`} style={containerStyle}>
        <button style={{ backgroundColor: 'transparent', border: 'none', padding: 0, outline: 'none' }} onClick={toggleCollapsed}>
          <div id='hamburger-area' style={{ backgroundColor: 'transparent', padding: '10px' }}>
            <FaBars style={iconStyle} />
          </div>
        </button>

        {items.map((item, index) => (
          <Link to='#' className='bg-sidebar list-group-item list-group-item-action' key={index}>
            {isCollapsed ? (
              <div className='d-flex flex-row'>
                <span className='side-icon'>{React.cloneElement(item.icon, { style: iconStyle })}</span>
              </div>
            ) : (
              <div className='d-flex flex-row'>
                <span className='side-icon'>{React.cloneElement(item.icon, { style: iconStyle })}</span>
                <span className='side-text' style={labelStyle}>
                  {item.label}
                </span>
              </div>
            )}
          </Link>
        ))}
      </div>
    </Router>
  )
}

export default CDCSideBar
