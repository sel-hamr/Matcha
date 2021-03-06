const axios = require('axios')
const Jimp = require('jimp')
function init(app, obj) {
  for (const [key, value] of Object.entries(obj)) app.locals[key] = value
}
async function fetchDataJSON(ip) {
  const res = await axios.get(`http://ip-api.com/json/${ip}`)
  return {
    Latitude: res.data.lat,
    Longitude: res.data.lon,
  }
}

function sendResponse(res, code, message, json) {
  res.status(code)
  if (json) res.json(message)
  else res.send(message)
  res.end()
}
function checkImage(src, locals) {
  return new Promise((resolve) => {
    if (src && src !== '') {
      const base64Data = src.split(',')
      if (base64Data.length > 1) {
        const nameImage = locals.crypto.randomBytes(16).toString('hex')
        const buffer = Buffer.from(base64Data[1], 'base64')
        Jimp.read(buffer, (err, res) => {
          if (err) resolve(null)
          else {
            res.quality(30).write(`./images/${nameImage}.jpg`)
            resolve(`/images/${nameImage}.jpg`)
          }
        })
      } else resolve(null)
    } else resolve(null)
  })
}
function checkImages(images) {
  return new Promise((resolve) => {
    let arr = []
    if (images.length > 0)
      images.forEach((image) => {
        let base64Data = image.split(',')
        if (base64Data.length > 1) {
          const buffer = Buffer.from(base64Data[1], 'base64')
          Jimp.read(buffer, (err, res) => {
            if (err) {
              resolve(false)
            } else {
              arr.push('ok')
            }
            if (arr.length === images.length) resolve(true)
          })
        } else resolve(false)
      })
    else resolve(false)
  })
}
function handleError(err, req, res, next) {
  if (err) {
    req.app.locals.sendResponse(res, 200, 'Bad Request')
  } else next()
}
let checkProfileOfYou = (token, UserName, locals) => {
  return new Promise(async (resolve) => {
    if (token && UserName && locals && token !== '' && UserName !== '') {
      const result = await locals.select('Users', ['UserName'], {
        Token: token,
        IsActive: 1,
      })
      if (result[0]) {
        if (result[0].UserName === UserName) resolve(true)
        else resolve(false)
      } else resolve(false)
    } else resolve(false)
  })
}
function handleError(err, req, res, next) {
  if (err) req.app.locals.sendResponse(res, 200, 'Bad Request')
  else next()
}
let getImage = (token, locals) => {
  return new Promise(async (resolve) => {
    if (token && locals && token != '') {
      const result = await locals.select('Users', ['Images'], {
        Token: token,
        IsActive: 1,
      })
      if (result[0]) resolve(result)
      else resolve(false)
    } else resolve(false)
  })
}

let getPassword = (token, locals) => {
  return new Promise(async (resolve, reject) => {
    if (token && locals && token != '') {
      const result = await locals.select('Users', ['Password'], {
        Token: token,
        IsActive: 1,
      })
      if (result[0]) resolve(result)
      else resolve(false)
    } else resolve(false)
  })
}
function getImageProfile(users) {
  return new Promise((resolve) => {
    let Array = []
    users.forEach((user) => {
      user.Images = JSON.parse(user.Images)[0]
      Array.push('ok')
      if (Array.length === users.length) resolve('ok')
    })
    if (Array.length === users.length) resolve('ok')
  })
}
function ifNotBlock(IdUserOwner, IdUserReceiver, locals) {
  return new Promise(async (resolve) => {
    const result1 = await locals.select('Blacklist', '*', {
      IdUserOwner: IdUserOwner,
      IdUserReceiver: IdUserReceiver,
    })
    const result2 = await locals.select('Blacklist', '*', {
      IdUserOwner: IdUserReceiver,
      IdUserReceiver: IdUserOwner,
    })
    if (!result1[0] && !result2[0]) resolve(true)
    else resolve(false)
  })
}

async function notification(req, Type, UserOwner, UserReceiver) {
  const locals = req.app.locals
  const IdUserOwner = await locals.getIdUserOwner(UserOwner)
  const IdUserReceiver = await locals.getIdUserOwner(UserReceiver)
  const ifNotBlock = await locals.ifNotBlock(IdUserOwner, IdUserReceiver, locals)
  if (IdUserOwner && IdUserReceiver && ifNotBlock) {
    let result = {
      insertId: null,
    }
    if (Type !== 'addFriend') {
      result = await locals.insert('Notifications', {
        IdUserOwner,
        IdUserReceiver,
        Type,
      })
      if (Type !== 'removeFriend')
        locals.insert('History', {
          IdUserOwner,
          IdUserReceiver,
          Content: `You ${Type} ${UserReceiver}`,
        })
    }
    if (locals.sockets && locals.sockets.length > 0 && locals.sockets[IdUserReceiver]) {
      const user = await locals.select('Users', ['IdUserOwner', 'Images', 'UserName', 'LastLogin', 'Active'], { IdUserOwner })
      if (Type === 'addFriend' || Type === 'LikedBack') {
        const messages = await locals.query('SELECT IdMessages As "id",IdUserOwner,Content,DateCreation As "date" FROM Messages WHERE (IdUserOwner=? AND idUserReceiver=?) OR (IdUserOwner=? AND IdUserReceiver=?) ORDER BY DateCreation DESC LIMIT 30', [
          IdUserOwner,
          IdUserReceiver,
          IdUserReceiver,
          IdUserOwner,
        ])
        const IsRead = await locals.select('Messages', 'COUNT(IsRead) AS IsRead', {
          IdUserReceiver: req.userInfo.IdUserOwner,
          IsRead: 0,
        })
        user[0].IsRead = IsRead.length > 0 ? IsRead[0].IsRead : 0
        user[0].messages = messages
      }
      user[0].Images = JSON.parse(user[0].Images)[0]
      locals.sockets[IdUserReceiver].map((item) =>
        item.emit(
          'notice',
          JSON.stringify({
            user: user.length > 0 ? user[0] : user,
            Type,
            IdNotification: result.insertId,
            DateCreation: new Date().toISOString(),
          })
        )
      )
    }
  }
}
function checkIfHasOneImage(req, res, next) {
  if (JSON.parse(req.userInfo.Images).length > 0) next()
  else res.app.locals.sendResponse(res, 200, 'You Need At lest One Image to do This Action')
}
async function CheckActive(Email, locals) {
  const result = await locals.query("SELECT COUNT(*) AS 'Count' FROM Users WHERE Email=? AND (IsActive=1 OR IsActive=2)", [Email])
  return result[0].Count === 1 ? true : false
}
async function verifierToken(Token, locals) {
  const result = await locals.query("SELECT COUNT(*) AS 'Count' FROM Users WHERE Token=? AND (IsActive=1 OR IsActive=2)", [Token])
  return result[0].Count === 1 ? true : false
}
async function getRating(UserOwner, locals) {
  const IdUserReceiver = await locals.getIdUserOwner(UserOwner)
  const avgRatingValue = await locals.select('Rating', 'SUM(RatingValue)/Count(*) AS "AVG"', { IdUserReceiver })
  return avgRatingValue && avgRatingValue.length > 0 && avgRatingValue[0].AVG ? avgRatingValue[0].AVG.toString() : '0'
}
async function myRating(UserOwner, UserReceiver, locals) {
  const IdUserReceiver = await locals.getIdUserOwner(UserOwner)
  const IdUserOwner = await locals.getIdUserOwner(UserReceiver)
  const avgRatingValue = await locals.select('Rating', 'SUM(RatingValue)/Count(*) AS "AVG"', { IdUserReceiver, IdUserOwner })
  return avgRatingValue && avgRatingValue.length > 0 && avgRatingValue[0].AVG ? avgRatingValue[0].AVG.toString() : '0'
}
async function CountRating(UserOwner, locals) {
  const IdUserReceiver = await locals.getIdUserOwner(UserOwner)
  const count = await locals.select('Rating', 'Count(*) AS "Count"', { IdUserReceiver })
  return count[0].Count
}
async function CountFriends(UserOwner, locals) {
  const IdUserReceiver = await locals.getIdUserOwner(UserOwner)
  const count = await locals.select('Friends', 'Count(*) AS "Count"', { IdUserReceiver, Match: 1 })
  return count[0].Count
}

async function checkIp(ip) {
  return (await axios.get(`http://ip-api.com/json/${ip}`)).data.status === 'success' ? true : false
}

module.exports = {
  fetchDataJSON,
  sendResponse,
  init,
  checkImage,
  checkImages,
  notification,
  handleError,
  checkProfileOfYou,
  getImage,
  getPassword,
  getImageProfile,
  ifNotBlock,
  checkIfHasOneImage,
  CheckActive,
  verifierToken,
  getRating,
  CountRating,
  CountFriends,
  myRating,
  checkIp,
}
