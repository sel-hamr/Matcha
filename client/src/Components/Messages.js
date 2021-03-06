import React, { useEffect, useContext, useState } from 'react'
import { ImageLoader } from './ImageLoader'
import '../Css/Messages.css'
import { DataContext } from '../Context/AppContext'

function Message(props) {
  const ctx = useContext(DataContext)
  return (
    <div className="Message" onClick={props.onClick}>
      <ImageLoader className="MessageImage" src={props.img} alt={props.name} />
      <div className="MessageColumn">
        <div className="MessageRow">
          <div className="MessageNameFriend">{props.name}</div>
          <div className="MessageDateLastMessage">{ctx.ref.ConvertDate(props.message.date)}</div>
        </div>
        <div className="MessageRow">
          <div className="MessageLastMessage">{props.message.Content}</div>
          {props.IsRead > 0 ? <div className="MessageCountNewMessage">{props.IsRead}</div> : null}
        </div>
      </div>
    </div>
  )
}
function Messages(props) {
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
    <div className="Messages" style={props.style ? props.style : {}}>
      {ctx.ref.sortUsesByDateMessages(friends).map((UserName) => {
        if (friends[UserName] && friends[UserName].messages.length > 0 && (friends[UserName].messages[0] !== 'limit' || friends[UserName].messages.length > 1))
          return (
            <Message
              key={'MSG' + friends[UserName].IdUserOwner}
              message={friends[UserName].messages[friends[UserName].messages.length - 1]}
              IsRead={friends[UserName].IsRead}
              name={friends[UserName].UserName}
              img={friends[UserName].Images}
              onClick={() => {
                ctx.cache.chatUserInfo = { ...friends[UserName] }
                ctx.ref.changeChatUserInfo({ ...friends[UserName] })
                ctx.ref.readMessages(UserName)
              }}
            />
          )
        return null
      })}
    </div>
  )
}
export { Messages }
