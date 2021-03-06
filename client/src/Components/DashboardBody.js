import React, { useState, useEffect, useContext } from 'react'
import IconMenu from './IconMenu'
import { Toggle } from './Toggle'
import '../Css/DashboardBody.css'
import { DataContext } from '../Context/AppContext'
import { Route, Switch, useHistory, useLocation } from 'react-router-dom'
import warring from '../Images/warning-animate.svg'
import { Users } from './Users'
import { Filter } from './Filter'
import Profile from './Profile'
import History from './History'
import FilterListIcon from '@material-ui/icons/FilterList'
import ProfileImage from './ProfileImage'

function IconComponent(props) {
  // eslint-disable-next-line
  useEffect(() => props.dataHome.ChangeStateMenu(), [])
  return (
    <div style={{ transform: 'rotate(-180deg)' }}>
      <IconMenu dataHome={props.dataHome} />
    </div>
  )
}
function DashboardBody(props) {
  let location = useLocation()
  const [hideFilter, changeHideFilter] = useState(true)
  const ctx = useContext(DataContext)
  const history = useHistory()

  useEffect(() => {
    let unmount = false
    if (location.pathname !== '/' && !unmount) changeHideFilter(true)
    return () => (unmount = true)
  }, [location])
  function Error404() {
    useEffect(() => {
      history.push('/')
    }, [])
    return <div></div>
  }
  return (
    <div className="DashboardBody" style={props.style ? props.style : {}}>
      <div className="DashboardBodyHeader">
        <div>
          {props.width <= 1240 ? (
            <IconComponent
              dataHome={{
                showMenu: 0,
                ChangeStateMenu: props.changeLayoutHide,
              }}
            />
          ) : null}
          <div className="DashboardBodyHeaderProfile">
            <ProfileImage Image={props.user.Image} UserName={props.user.UserName} Style={{ width: '35px', height: '35px' }} />
            <span>{`${props.user.FirstName} ${props.user.LastName}`}</span>
          </div>
          <div className="DashboardBodyHeaderSettings">
            {location.pathname === '/' ? (
              <FilterListIcon
                onClick={() => changeHideFilter((oldValue) => !oldValue)}
                style={{
                  width: '24px',
                  height: '28px',
                  color: 'var(--Icon-Fill)',
                  marginRight: '9px',
                  cursor: 'pointer',
                }}
              />
            ) : (
              ''
            )}

            <Toggle
              list={['Dark', 'Light']}
              active={ctx.cache.Mode}
              switch={() =>
                ctx.ref.changeMode((oldValue) => {
                  ctx.cache.Mode = oldValue === 'Dark' ? 'Light' : 'Dark'
                  return ctx.cache.Mode
                })
              }
              colors={['#FD7A48', '#7C79E4']}
            />
          </div>
        </div>
        {!hideFilter ? <Filter /> : null}
      </div>

      <div className="DashboardBodyContent">
        <Switch>
          <Route exact path="/">
            <Users user={props.user} />
          </Route>
          <Route path="/profile/:userName">
            <Profile user={props.user} changeUser={props.changeUser} />
          </Route>
          <Route path="/history">
            <History />
          </Route>
          <Route path="/ForgatPassword/:token">
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <img src={warring} alt="..." style={{ width: '50%' }} />
              <p style={{ fontSize: '27px', fontWeight: '600' }}>Logout then try again</p>
            </div>
          </Route>
          <Route path="*">
            <Error404 />
          </Route>
        </Switch>
      </div>
    </div>
  )
}
export { DashboardBody }
