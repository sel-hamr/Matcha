import React, { useState, createContext, useEffect, useRef } from 'react'
import axios from 'axios'
import io from 'socket.io-client'
import Axios from 'axios'
import { useHistory } from 'react-router-dom'

export const DataContext = createContext()
export default function AppContext(props) {
  const history = useHistory()
  const [isLogin, changeIsLogin] = useState('')
  const cache = {
    Mode: 'Light',
    userInfo: {},
    friends: {},
    users: [],
    notifications: {
      data: [],
      IsRead: 0,
    },
    IsRead: {
      messages: 0,
      notifications: 0,
    },
    chatUserInfo: {},
    filterData: {
      list: [],
      name: '',
      age: [18, 80],
      rating: [0, 5],
      location: [0, 1000],
      updated: false,
    },
    listInterest: [],
  }
  const ref = {
    ConvertDate: (date, type) => {
      const cmp = Math.abs(Date.now() - Date.parse(new Date(date)))
      const year = Math.floor(cmp / 31104000000)
      const month = Math.floor(cmp / 2592000000)
      const days = Math.floor(cmp / 86400000)
      const hours = Math.floor(cmp / 3600000)
      const minutes = Math.floor(cmp / 60000)
      const seconds = Math.floor(cmp / 1000)
      if (type && type === 'time') return new Date(date).toISOString().slice(10, 16).replace('T', ' ')
      if (type && type === 'date') return new Date(date).toISOString().slice(0, 10)
      if (year > 0) return `${year}y`
      else if (month > 0) return `${month}mo`
      else if (days > 0) return `${days}d`
      else if (hours > 0) return `${hours}h`
      else if (minutes > 0) return `${minutes}m`
      else if (seconds > 0) return `${seconds}s`
      return '1s'
    },
    sortUsesByDateMessages: (friends) => {
      const values = [...Object.values(friends)]
      if (values.length > 0) {
        const result = values.sort((a, b) => {
          if (a.messages && a.messages[a.messages.length - 1] === 'limit' && b.messages.length > 1) return 1
          else if (b.messages && b.messages[b.messages.length - 1] === 'limit' && a.messages.length > 1) return -1
          else if (a.messages.length > 1 && b.messages.length > 1) return Date.now() - Date.parse(a.messages[a.messages.length - 1].date) - (Date.now() - Date.parse(b.messages[b.messages.length - 1].date))
          return 0
        })
        result.map((item, index) => (result[index] = item.UserName))
        return result
      }
      return []
    },
    readMessages: (UserName) => {
      if (UserName) {
        Axios.get(`Messages/readMessages/${UserName}`).then(() => {
          if (cache.friends[UserName]) cache.friends[UserName].IsRead = 0
          ref.countIsRead()
        })
      }
    },
    readNotifications: () => {
      Axios.get(`Notifications/readNotifications`).then(() => {
        cache.notifications.IsRead = 0
        ref.countIsRead()
      })
    },
    removeDeplicate: (array1, array2, key) => {
      return [
        ...array1.filter((item1) => {
          let find = true
          array2.map((item2) => (find = item1[key] === item2[key] ? false : find))
          return find
        }),
        ...array2,
      ]
    },
    getUsers: (start, length) => {
      if (ref.changeUsersLoader) ref.changeUsersLoader(true)
      axios.post(`Users`, { ...cache.filterData, start, length }).then((data) => {
        if (data.data instanceof Array) {
          cache.users = ref.removeDeplicate(cache.users, data.data, 'IdUserOwner')
          if (ref.changeUsers) ref.changeUsers([...cache.users])
        }
        if (ref.changeUsersLoader) ref.changeUsersLoader(false)
      })
    },
    getMessages: (user) => {
      let oldHeight = null
      if (ref.ChatContent) oldHeight = ref.ChatContent.current.scrollHeight
      if (ref.changeHideLoader) ref.changeHideLoader(false)
      axios.get(`Messages/${user.UserName}/${user.messages.length}`).then((data) => {
        if (cache.friends[user.UserName]) cache.friends[user.UserName].messages = ref.removeDeplicate(data.data, cache.friends[user.UserName].messages, 'id')
        else cache.friends[user.UserName] = { ...user, messages: data.data }
        if (ref.changeFriends) ref.changeFriends({ ...cache.friends })
        if (ref.changeHideLoader) ref.changeHideLoader(true)
        if (oldHeight && ref.ChatContent) ref.ChatContent.current.scrollTop = ref.ChatContent.current.scrollHeight - oldHeight
        ref.countIsRead()
      })
    },
    getNotifications: () => {
      if (cache.notifications.data[cache.notifications.data.length - 1] !== 'limit') {
        if (ref.changeHideLoader) ref.changeHideLoader(false)
        axios.get(`Notifications/${cache.notifications.data.length}`).then((data) => {
          if (data.data !== 'None' && data.data !== 'Bad request') {
            cache.notifications.data = ref.removeDeplicate(cache.notifications.data, data.data.data, 'IdNotification')
            cache.notifications.IsRead = ref.changeNotifications ? 0 : data.data.IsRead
            if (ref.changeNotifications) ref.changeNotifications({ ...cache.notifications })
            if (ref.changeHideLoader) ref.changeHideLoader(true)
            ref.countIsRead()
          }
        })
      }
    },
    getListInterest: () => {
      axios.get('Users/listInterest').then((data) => {
        if (data.data instanceof Object) {
          cache.listInterest = data.data.list
          if (!cache.filterData.list || cache.filterData.list.length === 0) {
            cache.filterData.list = data.data.active
            if (ref.changeListActive) ref.changeListActive([...cache.filterData.list])
          }
          if (ref.changeListInterest) ref.changeListInterest([...cache.listInterest])
        }
      })
    },
    addFriend: (user) => {
      cache.friends[user.UserName] = { ...user }
      if (ref.changeFriends) ref.changeFriends({ ...cache.friends })
    },
    removeFriend: (userName) => {
      if (cache.friends[userName]) {
        const newObj = {}
        for (const [key, value] of Object.entries(cache.friends)) if (key !== userName) newObj[key] = value
        cache.friends = { ...newObj }
        if (ref.changeChatUserInfo) ref.changeChatUserInfo({})
        if (ref.changeFriends) ref.changeFriends({ ...cache.friends })
        ref.countIsRead()
      }
    },
    removeMessage: (UserName, id) => {
      if (cache.friends[UserName]) {
        axios.get(`Messages/deleteMessage/${id}`).then((data) => {
          if (data.data === 'message deleted') {
            cache.friends[UserName].messages.map((item, index) => (item.id === id ? cache.friends[UserName].messages.splice(index, 1) : 0))
            if (ref.changeFriends) ref.changeFriends({ ...cache.friends })
          }
        })
      }
    },
    removeNotification: (userName) => {
      if (cache.notifications.data.length > 0) {
        for (let i = 0; i < cache.notifications.data.length; i++)
          if (cache.notifications.data[i].UserName === userName) {
            cache.notifications.data.splice(i, 1)
            i--
          }
        if (ref.changeNotifications) ref.changeNotifications({ ...cache.notifications })
      }
    },
    countIsRead: () => {
      setTimeout(() => {
        let countMessages = 0
        Object.values(cache.friends).map((value) => (value.IsRead > 0 ? countMessages++ : 0))
        cache.IsRead.messages = countMessages
        cache.IsRead.notifications = cache.notifications.IsRead
        if (ref.changeIsRead) ref.changeIsRead({ ...cache.IsRead })
      }, 500)
    },
    search: (search, type) => {
      if (search && ref.changeNotifications && type === 'notifications')
        ref.changeNotifications({
          data: [...cache.notifications.data.filter((item) => item.UserName.indexOf(search) > -1)],
          IsRead: cache.notifications.IsRead,
        })
      else if (search && ref.changeFriends) {
        ref.changeFriends((oldValue) => {
          const newObject = {}
          Object.keys(oldValue).map((key) => {
            if (key.indexOf(search) > -1) newObject[key] = oldValue[key]
            return key
          })
          return newObject
        })
      } else if (ref.changeFriends) ref.changeFriends({ ...cache.friends })
    },
    reconfigAxios: () => {
      Axios.defaults.baseURL = 'http://' + window.location.hostname + ':5000/'
      Axios.defaults.headers.common['Authorization'] = `token ${localStorage.getItem('token')}`
    },
  }
  const socket = useRef(null)
  useEffect(() => {
    ref.reconfigAxios()
    try {
      Axios.get('/users')
        .then((result) => {
          if (result.data === 2) {
            history.push('/step')
          }
          changeIsLogin(result.data === 1 ? 'Login' : result.data === 2 ? 'Step' : 'Not login')
        })
        .catch((error) => {})
    } catch (error) {} // eslint-disable-next-line
  }, [])
  useEffect(() => {
    ref.reconfigAxios()
    if (isLogin && isLogin === 'Login') {
      try {
        socket.current = io(`http://${window.location.hostname}:5000`)
        socket.current.on('connect_error', () => 0)
        socket.current.on('connect_failed', () => 0)
        socket.current.on('disconnect', () => 0)
        socket.current.on('connect', () => {
          socket.current.emit('token', localStorage.getItem('token'))
          ref.getMessage = (messageObject) => {
            const { message, user } = JSON.parse(messageObject)
            const friend = cache.friends[user.UserName]
            if (friend) friend.messages = ref.removeDeplicate(cache.friends[user.UserName].messages, [{ ...message }], 'id')
            else
              cache.friends[user.UserName] = {
                ...user,
                messages: [{ ...message }],
              }
            cache.friends[user.UserName].IsRead = cache.userInfo && cache.userInfo.IdUserOwner !== message.IdUserOwner ? cache.friends[user.UserName].IsRead + 1 : cache.friends[user.UserName].IsRead
            if (cache.chatUserInfo.UserName) ref.readMessages(cache.chatUserInfo.UserName)
            if (ref.changeFriends) ref.changeFriends({ ...cache.friends })
            setTimeout(() => ref.scrollDown(), 0)
            ref.countIsRead()
          }
          socket.current.on('message', (obj) => ref.getMessage(obj))
          socket.current.on('notice', (noticeObject) => {
            const { user, Type, IdNotification, DateCreation } = JSON.parse(noticeObject)
            if (Type === 'addFriend') ref.addFriend(user)
            else if (Type === 'removeFriend') {
              ref.removeFriend(user.UserName)
              ref.removeNotification(user.UserName)
            } else {
              if (Type === 'LikedBack') ref.addFriend(user)
              else if (Type === 'Unlike') ref.removeFriend(user.UserName)
              cache.notifications.data = ref.removeDeplicate(
                [
                  {
                    IdNotification,
                    Type,
                    DateCreation,
                    UserName: user.UserName,
                    Images: user.Images,
                  },
                ],
                cache.notifications.data,
                'IdNotification'
              )
              cache.notifications.IsRead = cache.notifications.IsRead + 1
              if (ref.changeNotifications) {
                ref.readNotifications()
                ref.changeNotifications({ ...cache.notifications })
              }
              ref.countIsRead()
            }
          })
          socket.current.on('status', (statusObject) => {
            const { Active, date, UserName } = JSON.parse(statusObject)
            if (cache.friends[UserName]) {
              cache.friends[UserName].Active = Active
              cache.friends[UserName].LastLogin = date
              if (ref.changeFriends) ref.changeFriends({ ...cache.friends })
            }
          })
        })
      } catch (err) {}
      ref.sendMessage = (messageObject) => socket.current.emit('message', JSON.stringify(messageObject))
      ref.scrollDown = () => {
        if (ref.ChatContent && ref.ChatContent.current) ref.ChatContent.current.scrollTop = ref.ChatContent.current.scrollHeight
      }
      ref.getNotifications()
      Axios.get('Friends').then((data) => {
        if (data.data !== 'bad request' && data.data !== 'You Need At lest One Image to do This Action') {
          cache.friends = data.data
          setTimeout(() => {
            if (ref.changeFriends) ref.changeFriends({ ...cache.friends })
          }, 0)
          ref.countIsRead()
        }
      })
    } // eslint-disable-next-line
  }, [isLogin])

  return (
    <DataContext.Provider
      value={{
        socket,
        ref,
        cache,
        isLogin,
        changeIsLogin: (params) => {
          ref.reconfigAxios()
          changeIsLogin(params)
        },
      }}
    >
      {props.children}
    </DataContext.Provider>
  )
}
