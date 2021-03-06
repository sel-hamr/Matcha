import React from 'react'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemAvatar from '@material-ui/core/ListItemAvatar'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import ListItemText from '@material-ui/core/ListItemText'
import Button from '@material-ui/core/Button'
import Divider from '@material-ui/core/Divider'
import InputBase from '@material-ui/core/InputBase'
import SearchIcon from '@material-ui/icons/Search'
import { useWindowSize } from './UseWindowSize'
import { useHistory } from 'react-router-dom'
import Axios from 'axios'
import '../Css/History.css'
import ProfileImage from './ProfileImage'
import { DataContext } from '../Context/AppContext'

export default function History() {
  const ctx = React.useContext(DataContext)
  const [usersBlock, changeUsersBlock] = React.useState([])
  const [listHistory, changeListHistory] = React.useState([])
  const [active, changeActive] = React.useState('History')
  const width = useWindowSize()
  let history = useHistory()
  function switchActive(value) {
    changeActive((oldValue) => (oldValue === value ? oldValue : oldValue === 'History' ? 'BlackList' : 'History'))
  }
  const Unblock = (e) => {
    let index = e.target.closest('Button').getAttribute('data-index')
    try {
      Axios.post('/BlackList/Unblock', {
        UserName: e.target.closest('Button').getAttribute('data-user'),
      }).then((result) => {
        let ar = usersBlock
        ar.splice(index, 1)
        changeUsersBlock([...ar])
      })
    } catch (error) {}
  }
  React.useEffect(() => {
    let unmount = false
    try {
      Axios.get('/BlackList').then((result) => {
        if (!unmount) changeUsersBlock(result.data)
      })
    } catch (error) {}
    try {
      Axios.get('/History').then((result) => {
        if (!unmount) changeListHistory(result.data)
      })
    } catch (error) {}
    return () => (unmount = true)
  }, [])
  return (
    <div style={{ width: '90%', height: '94%' }}>
      <List>
        <div className="titerListUser">
          <ListItem>
            <div
              className="LayoutSwitch"
              style={{
                marginTop: '0px',
                marginBottom: '0px',
                backgroundColor: 'var(--background-DashboardBody)',
                marginLeft: '0px',
              }}
            >
              <div className="LayoutSwitchActive" style={active === 'History' ? { left: '6px' } : { left: '134px' }}></div>
              <div
                className={active === 'History' ? 'LayoutSwitchItem LayoutSwitchItemActive' : 'LayoutSwitchItem'}
                onClick={() => {
                  switchActive('History')
                }}
              >
                History
              </div>
              <div
                className={active === 'BlackList' ? 'LayoutSwitchItem LayoutSwitchItemActive' : 'LayoutSwitchItem'}
                onClick={() => {
                  switchActive('BlackList')
                }}
              >
                BlackList
              </div>
            </div>
            <ListItemSecondaryAction>
              <div className="search" style={{ marginRight: '5px' }}>
                <SearchIcon
                  style={{
                    color: 'var(--color-QuickActionsMenu)',
                    width: '19px',
                    marginLeft: '8px',
                    marginRight: '9px',
                  }}
                />
                <InputBase
                  placeholder="Search…"
                  onChange={(e) => {
                    if (active === 'History')
                      try {
                        Axios.post('/History/SearchHistory', {
                          UserName: e.target.value,
                        }).then((result) => {
                          changeListHistory([...result.data])
                        })
                      } catch (error) {}
                    else
                      try {
                        Axios.post('/BlackList/SearchUserBlock', {
                          UserName: e.target.value,
                        }).then((result) => {
                          changeUsersBlock([...result.data])
                        })
                      } catch (error) {}
                  }}
                  onFocus={(e) => {
                    e.target.closest('.search').style.width = '210px'
                  }}
                  onBlur={(e) => {
                    e.target.closest('.search').style.width = '140px'
                  }}
                />
              </div>
            </ListItemSecondaryAction>
          </ListItem>
        </div>
      </List>
      {active === 'BlackList' ? (
        <List style={{ height: '100%', overflow: 'auto' }}>
          {usersBlock.length !== 0 ? (
            usersBlock.map((user, key) => (
              <div key={key}>
                <ListItem>
                  {width >= 552 ? (
                    <ListItemAvatar>
                      <ProfileImage Image={user.Images} UserName={user.UserName} Style={{ width: '35px', height: '35px', borderRadius: '50%' }} />
                    </ListItemAvatar>
                  ) : (
                    ''
                  )}
                  <ListItemText primary={user.UserName} style={{ fontSize: '17px' }} alt="..." />
                  <ListItemSecondaryAction>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      data-user={user.UserName}
                      data-index={key}
                      style={{
                        fontWeight: '900',
                        borderRadius: '5px',
                        backgroundColor: 'var(--background-Nav)',
                      }}
                      onClick={Unblock}
                    >
                      Unblock
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />
              </div>
            ))
          ) : (
            <div
              style={{
                display: 'flex',
                marginLeft: 'auto',
                marginRight: 'auto',
                marginTop: '70px',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <p className="labelInfo" style={{ width: '230px', fontSize: '20px' }}>
                Ops... Users Not Found
              </p>
            </div>
          )}
        </List>
      ) : (
        <List style={{ height: '100%', overflow: 'auto' }}>
          {listHistory.length !== 0 ? (
            listHistory.map((user, key) => (
              <div key={key}>
                <ListItem onClick={() => history.push(`/Profile/${user.UserName}`)}>
                  <ListItemAvatar>
                    <ProfileImage Image={user.Images} UserName={user.UserName} Style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                  </ListItemAvatar>
                  <ListItemText primary={user.UserName} secondary={user.Content} style={{ fontSize: '17px', cursor: 'pointer' }} />
                  {width >= 552 ? (
                    <ListItemSecondaryAction>
                      <p style={{ color: 'var(--color-FriendInfo-firstChild)' }}>{ctx.ref.ConvertDate(user.DateCreation)}</p>
                    </ListItemSecondaryAction>
                  ) : (
                    ''
                  )}
                </ListItem>
                <Divider />
              </div>
            ))
          ) : (
            <div
              style={{
                display: 'flex',
                marginLeft: 'auto',
                marginRight: 'auto',
                marginTop: '70px',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <p className="labelInfo" style={{ width: '230px', fontSize: '20px' }}>
                Ops... History is empty
              </p>
            </div>
          )}
        </List>
      )}
    </div>
  )
}
