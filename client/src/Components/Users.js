import React, { useState, useEffect, useRef, useContext } from 'react'
import { IconInfo, IconBan, IconCheck, IconPin, IconStar } from './Icons'
import Rating from '@material-ui/lab/Rating'
import { ImageLoader } from './ImageLoader'
import { DataContext } from '../Context/AppContext'
import '../Css/Users.css'
import axios from 'axios'
import { useHistory } from 'react-router-dom'
function User(props) {
  let history = useHistory()
  const ctx = useContext(DataContext)
  const [imageIndex, changeImageIndex] = useState(0)
  const [clickLoad, changeClickLoad] = useState({
    addFriend: false,
    blockFriend: false,
  })
  const [ratingValue, changeRatingValue] = useState({
    avg: props.rating === null ? 0 : parseFloat(props.rating).toFixed(1),
    userValue: props.myRating,
  })
  function UserImageSlideButtonClick(event) {
    const index = [...event.target.parentNode.children].indexOf(event.target)
    changeImageIndex(index)
  }
  function clickRating(value, usernameReceiver) {
    axios
      .post('Rating', {
        usernameReceiver,
        RatingValue: parseFloat(value).toFixed(1),
      })
      .then((data) => {
        if (data.data instanceof Object && parseFloat(data.data.AVG) >= 0 && parseFloat(data.data.AVG) <= 5) {
          ctx.cache.users[props.index].rating = parseFloat(data.data.AVG).toFixed(1)
          changeRatingValue(() => ({
            userValue: value,
            avg: parseFloat(data.data.AVG).toFixed(1),
          }))
        }
      })
  }
  function addFriend(UserName) {
    axios
      .post('/Friends/Invite', { UserName })
      .then((data) => {
        if (data.data !== 'You Need At lest One Image to do This Action') props.removeUser(UserName)
      })
      .catch((err) => 0)
  }
  return (
    <div className="User" onClick={props.onClick}>
      <div className="UserImageSlideButtons">
        {props.images.map((img, index) => (
          <div key={index} className={index === imageIndex ? 'UserImageSlideButton UserImageSlideButtonActive' : 'UserImageSlideButton'} onClick={UserImageSlideButtonClick}></div>
        ))}
      </div>
      <div className="UserImages" style={{ transform: `translateX(${-imageIndex * 310}px)` }}>
        {props.images.map((img, index) => (
          <ImageLoader style={{ width: '310px', height: '380px' }} src={img} key={index} />
        ))}
      </div>
      <div className="UserBackground"></div>
      <div className="UserRating">
        <IconStar width={42} height={42} fill="#EFD077" />
        <div>{ratingValue.avg}</div>
      </div>
      <div className="UserName">{props.userName}</div>
      <div className="UserAgeGenre">
        {props.age}, {props.gender}
      </div>
      <div className="UserDistance">
        <IconPin width={16} height={16} fill="white" />
        {props.distance >= 1000 ? Math.floor(props.distance / 1000) + 'Km' : Math.floor(props.distance) + 'm'}
      </div>
      <div className="UserListInterest">
        {props.listInterest.map((item, index) => (
          <div key={index} className="UserListInterestItem">
            {'#'}
            {item}
          </div>
        ))}
      </div>
      <div className="UserActions">
        {props.userInfo.Image ? (
          <div
            className="UserActionsAccept"
            onClick={() => {
              if (!clickLoad.addFriend) {
                changeClickLoad((oldValue) => ({
                  ...oldValue,
                  addFriend: true,
                }))
                addFriend(props.userName)
              }
            }}
          >
            <IconCheck width={20} height={20} fill="#44DB44" />
          </div>
        ) : null}
        {props.userInfo.Image ? (
          <div
            className="UserActionsReport"
            onClick={() => {
              if (!clickLoad.blockFriend) {
                changeClickLoad((oldValue) => ({
                  ...oldValue,
                  blockFriend: true,
                }))
                props.blockUser(props.userName)
              }
            }}
          >
            <IconBan width={20} height={20} fill="#FB5454" />
          </div>
        ) : null}
        <div className="UserActionsInfo" onClick={() => history.push(`/profile/${props.userName}`)}>
          <IconInfo width={24} height={24} fill="white" />
        </div>
      </div>
      {props.userInfo.Image ? (
        <div className="UserActionsRating">
          <Rating name={props.IdUserOwner.toString()} defaultValue={0} value={ratingValue.userValue} max={5} precision={0.5} onChange={(event, value) => clickRating(value, props.userName)} />
        </div>
      ) : null}
    </div>
  )
}
function Users(props) {
  const ctx = useContext(DataContext)
  const [users, changeUsers] = useState(() => [...[...ctx.cache.users].splice(0, 24)])
  const [usersLoader, changeUsersLoader] = useState(false)
  const [length, changeLength] = useState(24)
  const usersRef = useRef()
  useEffect(() => {
    ctx.ref.changeUsers = changeUsers
    ctx.ref.changeUsersLoader = changeUsersLoader
    if (users.length === 0 && ctx.isLogin === 'Login') ctx.ref.getUsers(users.length, 24)
    return () => (ctx.ref.changeUsers = null)
    // eslint-disable-next-line
  }, [ctx.cache.filterData])
  function UsersScroll() {
    const { scrollHeight, scrollTop, offsetHeight } = usersRef.current
    if (offsetHeight + scrollTop + 300 > scrollHeight && !usersLoader && users[users.length - 1] !== 'limit') {
      if (length >= ctx.cache.users.length) ctx.ref.getUsers(ctx.cache.users.length, 24)
      else changeUsers([...[...ctx.cache.users].splice(0, length + 24)])
      changeLength((oldValue) => oldValue + 24)
    }
  }
  function UserClick(event) {
    if (!event.target.closest('.UserActionsRating') && !event.target.closest('.UserActions') && !event.target.closest('.UserImageSlideButtons')) {
      if (event.target.closest('.User').classList.contains('UserAfterClick')) event.target.closest('.User').classList.remove('UserAfterClick')
      else event.target.closest('.User').classList.add('UserAfterClick')
    }
  }
  function removeUser(UserName) {
    ctx.cache.users = ctx.cache.users.filter((item) => item.UserName !== UserName)
    if (users[users.length - 1] === 'limit') changeUsers([...ctx.cache.users])
    else ctx.ref.getUsers(users.length - 1, 1)
  }
  function blockUser(UserName) {
    axios.get(`/Profile/BlockUser/${UserName}`)
    removeUser(UserName)
  }
  return (
    <>
      <div className="Users" onScroll={UsersScroll} ref={usersRef}>
        {users.map((obj, index) => {
          if (index < length && obj !== 'limit')
            return (
              <User
                index={index}
                key={obj.IdUserOwner}
                IdUserOwner={obj.IdUserOwner}
                images={JSON.parse(obj.Images)}
                city={obj.City}
                rating={obj.rating}
                myRating={obj.myRating}
                gender={obj.Gender}
                age={obj.Age}
                userName={obj.UserName}
                distance={obj.distance}
                listInterest={JSON.parse(obj.ListInterest)}
                removeUser={removeUser}
                blockUser={blockUser}
                onClick={UserClick}
                userInfo={props.user}
              />
            )
          return null
        })}
      </div>
      {usersLoader ? <div className="UsersLoader"></div> : null}
    </>
  )
}
export { Users }
