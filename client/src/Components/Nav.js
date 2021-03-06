import React, { useContext } from 'react'
import { DataContext } from '../Context/AppContext'
import { NavLink } from 'react-router-dom'
import { IconHome, IconProfile, IconHistory } from './Icons'
import '../Css/Nav.css'
function Nav(props) {
  const ctx = useContext(DataContext)
  return (
    <nav style={props.style ? props.style : {}} className={props.className ? `Nav${props.className}` : 'Nav'}>
      <div className="Logo">
        <NavLink
          className="NavLink"
          to="/"
          exact
          style={{
            justifyContent: 'center',
            alignItems: 'baseline',
          }}
        >
          <h1 style={{ fontSize: '28px' }}>Matcha</h1>
          <span style={{ margin: '6px' }}>Menu</span>
        </NavLink>
      </div>
      <div className="Menu">
        <NavLink className="NavLink" activeClassName="NavLinkActive" to="/" exact>
          <IconHome fill="#318fb5" width={20} height={20} />
          <span>Home</span>
        </NavLink>
        <NavLink className="NavLink" activeClassName="NavLinkActive" to={`/profile/${props.user.UserName}`}>
          <IconProfile fill="#318fb5" width={20} height={20} />
          <span>Profile</span>
        </NavLink>
        <NavLink className="NavLink" activeClassName="NavLinkActive" to="/history" exact>
          <IconHistory fill="#318fb5" width={20} height={20} />
          <span>History</span>
        </NavLink>
      </div>
      <div className="Logout">
        <NavLink
          className="NavLink"
          to="/logout"
          exact
          onClick={() => {
            localStorage.clear()
            if (ctx.socket && ctx.socket.current) {
              ctx.socket.current.close()
              ctx.socket.current = null
            }
            window.location.reload()
          }}
        >
          Logout
        </NavLink>
      </div>
    </nav>
  )
}
export { Nav }
