import React, { useState, useContext, useEffect } from 'react'
import { IconSendMessage, IconCircle } from './Icons'
import { ImageLoader } from './ImageLoader'
import '../Css/Friends.css'
import { DataContext } from '../Context/AppContext'
import { useHistory } from 'react-router-dom'
function Friend(props) {
  const ctx = useContext(DataContext)
  const history = useHistory()
  return (
    <div
      className="Friend"
      onClick={() => {
        if (!ctx.cache.chatUserInfo.UserName) history.push(`/profile/${props.name}`)
      }}
    >
      <div className="FriendImage">
        <ImageLoader className="FriendImageImage" src={props.image} alt={props.name} />
      </div>
      <div className="FriendInfo">
        <span>{props.name}</span>
        <span style={props.active > 0 ? { color: '#44db44' } : {}}>
          {props.active > 0 ? (
            <>
              <IconCircle width={8} fill="#44db44" /> Active now
            </>
          ) : (
            ctx.ref.ConvertDate(props.date)
          )}
        </span>
      </div>
      <div className="FriendActions">
        <div className="FriendProfile">
          <button onClick={() => props.OpenChatBox()}>
            <IconSendMessage width={21} height={21} fill="#2d2d2d" />
          </button>
        </div>
      </div>
    </div>
  )
}
function Friends(props) {
  const ctx = useContext(DataContext)
  const [friends, changeFriends] = useState({ ...ctx.cache.friends })
  useEffect(() => {
    ctx.ref.search(props.search) // eslint-disable-next-line
  }, [props.search])
  useEffect(() => {
    ctx.ref.changeFriends = changeFriends
    return () => (ctx.ref.changeFriends = null) // eslint-disable-next-line
  }, [])
  return (
    <div className="Friends" style={props.style ? props.style : {}}>
      {Object.values(friends).map((obj) => (
        <Friend
          key={'Friends' + obj.IdUserOwner}
          image={obj.Images}
          name={obj.UserName}
          active={obj.Active}
          date={obj.LastLogin}
          OpenChatBox={() => {
            ctx.cache.chatUserInfo = { ...obj }
            ctx.ref.changeChatUserInfo({ ...obj })
            ctx.ref.readMessages(obj.UserName)
          }}
        />
      ))}
    </div>
  )
}
export { Friends }
