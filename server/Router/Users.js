const express = require('express')
const router = express.Router()
const { Validate } = require('../tools/validate')
const md5 = require('md5')
const haversine = require('haversine-distance')
const { auth } = require('./Authentication')
require('dotenv').config({
  path: __dirname + '/../.env',
})

router.get('/', auth, async function (req, res) {
  const locals = req.app.locals
  locals.sendResponse(res, 200, req.userInfo.IsActive, true)
})

router.post('/', auth, async function (req, res) {
  const { Latitude, Longitude } = req.userInfo
  const { list, age, name, location, rating, start, length } = req.body
  const locals = req.app.locals
  if ((!name || (name && name.length <= 255)) && list instanceof Array && list.length <= 5 && list.toString().length <= 255 && location instanceof Array && location.length === 2 && location[0] >= 0 && location[1] <= 1000 && start >= 0 && length > 0) {
    let filterResult = await locals.filter({ IdUserOwner: req.userInfo.IdUserOwner, name, age, rating, sexual: req.userInfo.Sexual })
    let newFilterResult = []
    const listInterest = [...list, ...JSON.parse(req.userInfo.ListInterest)]
    if (filterResult && filterResult.length > 0) {
      filterResult.map((item) => {
        item.rating = item.rating === null ? 0 : item.rating
        item.distance = haversine({ lat: item.Latitude, lng: item.Longitude }, { lat: Latitude, lng: Longitude })
        const km = item.distance / 1000
        if ((location[1] === 1000 && km >= location[0]) || (km >= location[0] && km <= location[1])) newFilterResult.push(item)
      })
      function cmp(a, b) {
        const keysNeedToCompare = ['distance', 'rating', 'Age']
        let count1 = 0,
          count2 = 0
        listInterest.map((item) => {
          if (JSON.parse(a.ListInterest).indexOf(item) > -1) count1++
          if (JSON.parse(b.ListInterest).indexOf(item) > -1) count2++
        })
        for (const key of Object.keys(a)) {
          if (keysNeedToCompare.indexOf(key) > -1) {
            const inc = key === 'rating' ? 1 : -1
            if (a[key] > b[key]) count1 += inc
            else if (a[key] < b[key]) count2 += inc
          }
        }
        return count2 - count1
      }
      newFilterResult.sort(cmp)
      newFilterResult = newFilterResult.slice(start, length + start)
      if (newFilterResult.length < length) newFilterResult.push('limit')
      locals.sendResponse(res, 200, newFilterResult, true)
    } else locals.sendResponse(res, 200, 'None')
  } else locals.sendResponse(res, 200, 'bad request')
})

router.get('/listInterest', auth, async function (req, res) {
  const result = await req.app.locals.select('Users', 'ListInterest', { IsActive: 1 })
  const myList = await req.app.locals.select('Users', 'ListInterest', {
    IdUserOwner: req.userInfo.IdUserOwner,
  })
  let listInterest = []
  result.map((item) => (item.ListInterest ? listInterest.push(...JSON.parse(item.ListInterest)) : 0))
  listInterest = [...new Set(listInterest)]
  req.app.locals.sendResponse(
    res,
    200,
    {
      list: listInterest,
      active: myList.length > 0 ? JSON.parse(myList[0].ListInterest) : [],
    },
    true
  )
})
router.post('/ForgatPassword', async function (req, res) {
  const { Email } = req.body
  const locals = req.app.locals
  if (Validate('Email', Email)) {
    const result = await locals.select('Users', '*', { Email })
    if (result && result.length !== 0) {
      if (await locals.CheckActive(Email, locals)) {
        locals.sendMail('create new password your email address', 'to create new password', Email, result[0].UserName, `${process.env.CLIENT_PROTOCOL}://${req.headers.host.split(':')[0]}:${process.env.CLIENT_PORT}/ForgatPassword/${result[0].Token}`)
        locals.sendResponse(res, 200, result[0].Email)
      } else locals.sendResponse(res, 200, 'Email not Active')
    } else locals.sendResponse(res, 200, 'Email not Found')
  } else locals.sendResponse(res, 200, 'Bad Request')
})
router.post('/verifierToken', async function (req, res) {
  const { Token } = req.body
  const locals = req.app.locals
  res.send(await locals.verifierToken(Token, locals))
})

router.get('/Active/:token', async function (req, res) {
  const Token = req.params.token
  const locals = req.app.locals
  if (Token) {
    const result = await locals.select('Users', "COUNT(*) AS 'Count'", { Token })
    if (result && result.length > 0 && result[0].Count === 1) {
      locals.update('Users', { IsActive: 2, Token: locals.crypto.randomBytes(64).toString('hex') }, { Token })
      res.writeHead(307, { location: `${process.env.CLIENT_PROTOCOL}://${req.headers.host.split(':')[0]}:${process.env.CLIENT_PORT}/` })
      res.end()
    } else locals.sendResponse(res, 200, 'Account Not Found')
  } else locals.sendResponse(res, 200, 'Account Not Found')
})

router.post('/ResetPassword', async function (req, res) {
  const { Token, Password, Confirm } = req.body
  const locals = req.app.locals
  if (Token && Validate('Password', Confirm) && Password === Confirm) {
    const result = await locals.verifierToken(Token, locals)
    if (result) {
      const resultUpdate = await locals.update('Users', { Password: md5(Password), Token: locals.crypto.randomBytes(64).toString('hex'), JWT: null }, { Token })
      if (resultUpdate) locals.sendResponse(res, 200, 'Account is Active')
      else locals.sendResponse(res, 200, 'Error on Update Password')
    } else locals.sendResponse(res, 200, 'account not found')
  } else locals.sendResponse(res, 200, 'Bad Request')
})

router.get('/UserNameIsReadyTake/:userName', async function (req, res) {
  const locals = req.app.locals
  let test = await locals.checkUserExist({ UserName: req.params.userName })
  locals.sendResponse(res, 200, test)
})

router.get('/EmailIsReadyTake/:email', async function (req, res) {
  const locals = req.app.locals
  let test = await locals.checkUserExist({ Email: req.params.email })
  locals.sendResponse(res, 200, test)
})
router.get('/MyInfo', auth, async function (req, res) {
  const locals = req.app.locals
  const result = await locals.select('Users', ['FirstName', 'LastName', 'UserName', 'Images'], { Token: req.userInfo.Token })
  let myInfo = { ...result[0], Images: JSON.parse(result[0].Images)[0] }
  res.send(myInfo)
})

module.exports = router
