import React, { useContext, useState, useEffect } from 'react'
import { Friends } from './Friends'
import '../Css/QuickActions.css'
import { Search } from './Search'
import { Messages } from './Messages' // eslint-disable-next-line
import { Chat } from './Chat' // eslint-disable-next-line
import { IconBack } from './Icons'
import { Notification } from './Notification'
import { DataContext } from '../Context/AppContext'
import { PeopleAlt as PeopleAltIcon, Mail as MailIcon, Notifications as NotificationsIcon } from '@material-ui/icons'
import { Tabs, Tab, Paper, Badge } from '@material-ui/core'
function QuickActions(props) {
  const ctx = useContext(DataContext)
  const [CurrentAction, ChangeCurrentAction] = useState('Friends')
  const [search, changeSearch] = useState('')
  const [chatUserInfo, changeChatUserInfo] = useState({})
  const [IsRead, changeIsRead] = useState({ ...ctx.cache.IsRead })
  useEffect(() => {
    ctx.ref.changeChatUserInfo = changeChatUserInfo
    ctx.ref.changeIsRead = changeIsRead
    return () => {
      ctx.ref.changeChatUserInfo = null
      ctx.ref.changeIsRead = null
    } // eslint-disable-next-line
  }, [])
  return (
    <div
      className="QuickActionsChatBox"
      style={{
        height: '100%',
        width: '30%',
        minWidth: '285px',
        maxWidth: '390px',
        display: 'flex',
        flexFlow: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: 'var(--background-QuickActions)',
        transition: '0.5s linear',
      }}
    >
      <div
        className={props.className ? `QuickActions${props.className}` : 'QuickActions'}
        style={
          props.style
            ? {
                ...props.style,
                display: chatUserInfo.UserName ? 'none' : 'flex',
              }
            : { display: chatUserInfo.UserName ? 'none' : 'flex' }
        }
      >
        <Paper square>
          <Tabs
            value={['Friends', 'Messages', 'Notification'].indexOf(CurrentAction)}
            onChange={(event, value) => {
              ChangeCurrentAction(['Friends', 'Messages', 'Notification'][value])
              if (value === 2) ctx.ref.readNotifications()
            }}
            variant="fullWidth"
            indicatorColor="secondary"
            textColor="secondary"
            aria-label="icon label tabs example"
          >
            <Tab
              icon={
                <Badge color="secondary">
                  <PeopleAltIcon />
                </Badge>
              }
              label="Friends"
            />
            <Tab
              icon={
                <Badge color={IsRead.messages === 0 ? 'secondary' : 'error'} badgeContent={IsRead.messages} showZero>
                  <MailIcon />
                </Badge>
              }
              label="Messages"
            />
            <Tab
              icon={
                <Badge color={IsRead.notifications === 0 ? 'secondary' : 'error'} badgeContent={IsRead.notifications} showZero>
                  <NotificationsIcon />
                </Badge>
              }
              label="Notification"
            />
          </Tabs>
        </Paper>
        <Search search={search} changeSearch={changeSearch} />
        {CurrentAction === 'Friends' && !chatUserInfo.UserName ? <Friends search={search} /> : null}
        {CurrentAction === 'Messages' && !chatUserInfo.UserName ? <Messages search={search} /> : null}
        {CurrentAction === 'Notification' && !chatUserInfo.UserName ? <Notification search={search} /> : null}
      </div>
      {chatUserInfo.UserName ? (
        <div
          className="CloseChat"
          onClick={() => {
            ctx.cache.chatUserInfo = {}
            changeChatUserInfo({})
          }}
        >
          <IconBack width={20} height={20} fill="#6e97ee" />
          <div>Back To Messages</div>
        </div>
      ) : null}
      {chatUserInfo.UserName ? <Chat /> : null}
    </div>
  )
}
export { QuickActions }
