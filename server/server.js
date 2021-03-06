const express = require('express')
const app = express()
const http = require('http').createServer(app)
const cors = require('cors')
const bodyParser = require('body-parser')
const users = require('./Router/Users')
const { Authentication, auth } = require('./Router/Authentication')
const rating = require('./Router/Rating')
const tools = require('./tools/tools')
const mysql = require('./tools/mysql')
const { sendMail } = require('./tools/mail')
const crypto = require('crypto')
const Friends = require('./Router/Friends')
const Messages = require('./Router/Messages')
const Notifications = require('./Router/Notifications')
const Profile = require('./Router/Profile')
const BlackList = require('./Router/BlackList')
const History = require('./Router/History')
const io = require('socket.io')(http, {
  transports: ['websocket', 'polling'],
  cors: {
    origin: '*',
  },
})
const validate = require('./tools/validate')

tools.init(app, { ...mysql, ...tools, sendMail, crypto, ...validate, sockets: [] })
async function sendFriendMyState(Active, IdUserOwner, UserName, sockets) {
  const friends = await mysql.query('SELECT * FROM Friends WHERE `Match`=1 AND (IdUserOwner=? OR IdUserReceiver=?)', [IdUserOwner, IdUserOwner])
  if (friends.length > 0)
    friends.map((friend) => {
      if (friend.IdUserOwner !== IdUserOwner && sockets[friend.IdUserOwner])
        sockets[friend.IdUserOwner].map((item) =>
          item.emit(
            'status',
            JSON.stringify({
              UserName,
              Active,
              date: new Date(Date.now()).toISOString(),
            })
          )
        )
      else if (friend.IdUserReceiver !== IdUserOwner && sockets[friend.IdUserReceiver])
        sockets[friend.IdUserReceiver].map((item) =>
          item.emit(
            'status',
            JSON.stringify({
              UserName,
              Active,
              date: new Date(Date.now()).toISOString(),
            })
          )
        )
    })
}
io.on('connection', (socket) => {
  socket.on('token', async (token) => {
    const result = await mysql.select('Users', ['UserName', 'IdUserOwner', 'Images'], {
      JWT: token,
    })
    if (result.length > 0) {
      mysql.update('Users', { Active: 1 }, { IdUserOwner: result[0].IdUserOwner, UserName: result[0].UserName })
      socket.IdUserOwner = result[0].IdUserOwner
      socket.UserName = result[0].UserName
      socket.Images = JSON.parse(result[0].Images)[0]
      if (app.locals.sockets[result[0].IdUserOwner]) app.locals.sockets[result[0].IdUserOwner].push(socket)
      else app.locals.sockets[result[0].IdUserOwner] = [socket]
      setTimeout(() => sendFriendMyState(1, result[0].IdUserOwner, result[0].UserName, app.locals.sockets), 500)
    }
  })
  socket.on('message', async (obj) => {
    if (obj) {
      const { user, message } = JSON.parse(obj)
      const sockets = app.locals.sockets
      if (user.UserName && message && message.Content.trim() && message.Content.trim().length < 255 && socket.UserName) {
        const IdUserOwner = await mysql.getIdUserOwner(user.UserName)
        const result = await mysql.query('SELECT * FROM Friends WHERE `Match`=1 AND ((IdUserOwner=? AND IdUserReceiver=?) OR (IdUserOwner=? AND IdUserReceiver=?))', [socket.IdUserOwner, IdUserOwner, IdUserOwner, socket.IdUserOwner])
        ifNotBlock = await app.locals.ifNotBlock(IdUserOwner, socket.IdUserOwner, app.locals)
        if (result.length > 0 && ifNotBlock) {
          const resultInsert = await mysql.insert('Messages', {
            IdUserOwner: socket.IdUserOwner,
            IdUserReceiver: IdUserOwner,
            Content: message.Content,
          })
          if (sockets[user.IdUserOwner] && sockets[user.IdUserOwner].length > 0)
            sockets[user.IdUserOwner].map((item) =>
              item.emit(
                'message',
                JSON.stringify({
                  user: {
                    UserName: socket.UserName,
                    Images: socket.Images,
                    Active: 1,
                  },
                  message: {
                    id: resultInsert.insertId,
                    IdUserOwner: socket.IdUserOwner,
                    Content: message.Content,
                    date: new Date(Date.now()).toISOString(),
                  },
                })
              )
            )
          if (sockets[socket.IdUserOwner] && sockets[socket.IdUserOwner].length > 0)
            sockets[socket.IdUserOwner].map((item) =>
              item.emit(
                'message',
                JSON.stringify({
                  user,
                  message: {
                    id: resultInsert.insertId,
                    IdUserOwner: socket.IdUserOwner,
                    Content: message.Content,
                    date: new Date(Date.now()).toISOString(),
                  },
                })
              )
            )
        }
      }
    }
  })
  socket.on('disconnect', async () => {
    if (socket.UserName) {
      app.locals.sockets[socket.IdUserOwner] = app.locals.sockets[socket.IdUserOwner].filter((item) => item.id !== socket.id)
      if (app.locals.sockets[socket.IdUserOwner].length === 0) {
        mysql.update('Users', { Active: 0, LastLogin: new Date(Date.now()) }, { IdUserOwner: socket.IdUserOwner })
        setTimeout(() => sendFriendMyState(0, socket.IdUserOwner, socket.UserName, app.locals.sockets), 500)
      }
    }
  })
})
app.use(cors())
app.use(bodyParser.json({ limit: '50mb' }))
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))
app.use('/Authentication', Authentication)
app.use('/Users', users)
app.use('/Rating', auth, rating)
app.use('/Friends', auth, Friends)
app.use('/Messages', auth, Messages)
app.use('/Notifications', auth, Notifications)
app.use('/Profile', auth, Profile)
app.use('/BlackList', auth, BlackList)
app.use('/History', auth, History)
app.get('/images/:image', (req, res) => {
  res.sendFile(`${__dirname}/images/${req.params.image}`)
})
app.use(tools.handleError)
http.listen(process.env.PORT)
