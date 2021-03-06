import React, { useState, useEffect, useRef, useContext } from 'react'
import { Loader } from './Loader'
import { DataContext } from '../Context/AppContext'
import { IconSendMessage, IconArrowDownChat } from './Icons'
import '../Css/Chat.css'
import { ImageLoader } from './ImageLoader'

function ChatMessage(props) {
  const [hideDeleteMessage, changeHideDeleteMessage] = useState(false)
  return (
    <div
      className="chatMessage"
      style={{
        justifyContent: props.pos === 'left' ? 'flex-start' : 'flex-end',
      }}
    >
      <div
        className="ChatMessageContent"
        style={{
          backgroundColor: props.pos === 'right' ? '#E6E8F4' : '#3D88B7',
          color: props.pos === 'right' ? 'black' : 'white',
        }}
        onClick={() => changeHideDeleteMessage((oldValue) => !oldValue)}
      >
        <div className="ChatMessageText">{props.message}</div>
        <div className="ChatMessageTime">{props.time}</div>
      </div>
      {props.pos !== 'left' ? (
        <div
          className="ChatMessageDelete"
          title="delete"
          style={{
            left: '0',
            display: hideDeleteMessage ? 'block' : 'none',
          }}
        >
          <div style={{ color: 'red', fontSize: '13px', cursor: 'pointer' }} onClick={props.removeMessage}>
            delete
          </div>
        </div>
      ) : null}
    </div>
  )
}
function Chat(props) {
  const [hideScrollDown, changeHideScrollDown] = useState(false)
  const [hideLoader, changeHideLoader] = useState(true)
  const ctx = useContext(DataContext)
  const [friends, changeFriends] = useState({ ...ctx.cache.friends })
  const ChatContent = useRef()
  const chatTextValue = useRef('')
  const UserName = ctx.cache.chatUserInfo.UserName
  useEffect(() => {
    ctx.ref.changeFriends = changeFriends
    ctx.ref.ChatContent = ChatContent
    ctx.ref.changeHideLoader = changeHideLoader
    setTimeout(() => ctx.ref.scrollDown(), 0)
    return () => {
      ctx.ref.changeFriends = null
      ctx.ref.ChatContent = null
      ctx.ref.changeHideLoader = null
    }
    // eslint-disable-next-line
  }, [])
  function onScroll() {
    const { offsetHeight, scrollHeight, scrollTop } = ChatContent.current
    if (scrollHeight - (scrollTop + offsetHeight) > 30) changeHideScrollDown((oldValue) => (oldValue ? oldValue : true))
    else changeHideScrollDown(false)
    if (scrollTop === 0 && ctx.cache.friends[UserName] && ctx.cache.friends[UserName].messages[0] !== 'limit') ctx.ref.getMessages(ctx.cache.friends[UserName])
  }
  function sendMessage() {
    if (chatTextValue.current.value.trim() !== '') {
      ctx.ref.sendMessage({
        message: {
          Content: chatTextValue.current.value,
          date: new Date().toISOString(),
          IdUserReceiver: ctx.cache.chatUserInfo.IdUserOwner,
        },
        user: { ...ctx.cache.chatUserInfo, messages: null },
      })
      chatTextValue.current.value = ''
      // setTimeout(() => ctx.ref.scrollDown(), 0)
    }
  }
  return (
    <div
      className="Chat"
      style={props.style ? props.style : {}}
      onKeyUp={(event) => {
        if (event.keyCode === 13) sendMessage()
      }}
    >
      <div className="ChatHeader">
        <div className="ChatImage" style={friends[UserName].Active ? { '--color-online': '#44db44' } : { '--color-online': '#a5a5a5' }}>
          <ImageLoader src={ctx.cache.chatUserInfo.Images} alt={UserName} />
        </div>
        <div className="ChatUserInfo">
          <div className="ChatUserInfoName">{UserName}</div>
        </div>
      </div>
      <div className="ChatContent" ref={ChatContent} onScroll={onScroll}>
        {!hideLoader ? (
          <Loader
            style={{
              margin: 'auto',
              zIndex: 11,
            }}
          />
        ) : null}
        {friends[UserName]
          ? friends[UserName].messages.map((msg) => {
              if (msg !== 'limit') return <ChatMessage key={'Message' + msg.id} pos={msg.IdUserOwner !== ctx.cache.chatUserInfo.IdUserOwner ? 'right' : 'left'} message={msg.Content} time={ctx.ref.ConvertDate(msg.date, 'time')} removeMessage={() => ctx.ref.removeMessage(UserName, msg.id)} />
              return null
            })
          : null}
      </div>
      {hideScrollDown ? <IconArrowDownChat className="ScrollDown" width={18} height={18} onClick={() => ctx.ref.scrollDown()} /> : null}
      <div className="ChatSendMessage">
        <div className="ChatSendMessageButton">
          <input type="text" placeholder="Enter Message" ref={chatTextValue} />
        </div>
        <div className="ChatSendButton">
          <IconSendMessage width={24} height={24} fill="#6e97ee" onClick={sendMessage} />
        </div>
      </div>
    </div>
  )
}
export { Chat }
