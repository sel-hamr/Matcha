import React, { useContext } from 'react'
import '../Css/header.css'
import logo from '../Images/logo.svg'
import { DataContext } from '../Context/AppContext'
import { Toggle } from './Toggle'
import { useLocation } from 'react-router-dom'
import { useHistory } from 'react-router-dom'

const Header = (props) => {
  let location = useLocation()
  let history = useHistory()
  const ctx = useContext(DataContext)
  return (
    <div className="header">
      <div className="logo">
        <img src={logo} alt="..." />
        <p
          style={{
            color: ctx.cache.Mode === 'Dark' ? 'white' : 'black',
          }}
        >
          Matcha
        </p>
      </div>
      <div className="menu">
        <Toggle
          list={['Light', 'Dark']}
          active={ctx.cache.Mode}
          switch={() => {
            ctx.ref.changeMode((oldValue) => {
              ctx.cache.Mode = oldValue === 'Dark' ? 'Light' : 'Dark'
              return ctx.cache.Mode
            })
          }}
          colors={['#03a9f1', '#292f3f']}
        />
        <button
          className="ft_btn"
          style={{ height: '33px' }}
          onClick={() => {
            if (location.pathname.includes('/step')) {
              localStorage.clear()
              window.location.reload()
            } else {
              history.push('/')
              props.dataHome.StateHome === 3 ? props.dataHome.ChangeHome(2) : props.dataHome.ChangeHome(3)
            }
          }}
        >
          {location.pathname.includes('/step') ? 'logout' : props.dataHome.StateHome === 3 ? 'sing up' : 'sing in'}
        </button>
      </div>
    </div>
  )
}

export default Header
