const express = require('express')
const router = express.Router()
const md5 = require('md5')
const jwt = require('jsonwebtoken')

const { Validate, isValidDate, getAge } = require('../tools/validate')
require('dotenv').config({ path: __dirname + '/../.env' })

async function auth(req, res, next) {
  const authorization = req.headers['authorization']
  const locals = req.app.locals
  if (authorization) {
    if (authorization.split(' ').length > 1) {
      jwt.verify(authorization.split(' ')[1], process.env.JWT_KEY, async (err, payload) => {
        const result = await locals.select('Users', '*', {
          JWT: authorization.split(' ')[1],
        })
        if (result.length > 0 && (result[0].IsActive === 1 || req.path === '/CompleteInsert' || req.path === '/')) {
          if (payload) {
            req.userInfo = result[0]
            next()
          } else if (err.message === 'jwt expired') locals.sendResponse(res, 200, 'Access token expired')
          else locals.sendResponse(res, 200, 'User not authenticated')
        } else locals.sendResponse(res, 200, 'token invalid')
      })
    } else locals.sendResponse(res, 200, 'token invalid')
  } else {
    locals.sendResponse(res, 200, 'token not found')
  }
}
router.get('/Logout', auth, function (req, res) {
  if (req.userInfo) {
    req.app.locals.update('Users', { Active: 0 }, { JWT: req.userInfo.JWT })
    req.app.locals.sendResponse(res, 200, "You're now logout")
  } else req.app.locals.sendResponse(res, 200, 'Something wrong please try again')
})
router.post('/Login', async function (req, res) {
  const locals = req.app.locals
  const { UserName, Password } = req.body
  if (Validate('Username', UserName) && Validate('Password', Password)) {
    const resultInfo = await locals.select('Users', ['FirstName', 'LastName', 'UserName', 'Images', 'IdUserOwner', 'JWT', 'IsActive'], {
      UserName,
      Password: md5(Password),
    })
    if (resultInfo.length !== 0) {
      let data = resultInfo[0]
      if (data.IsActive === 1)
        data = {
          ...data,
          Images: resultInfo[0].Images ? JSON.parse(resultInfo[0].Images)[0] : '',
        }
      if (data.IsActive === 2) data = { ...data, Images: '' }
      if (data.JWT) locals.sendResponse(res, 200, { accessToken: data.JWT, data }, true)
      else {
        if (data.IsActive === 1 || data.IsActive === 2) {
          const accessToken = jwt.sign(data.IdUserOwner, process.env.JWT_KEY)
          const resultUpdateJWT = await locals.update('Users', { JWT: accessToken }, { IdUserOwner: data.IdUserOwner })
          if (resultUpdateJWT) locals.sendResponse(res, 200, { accessToken, data }, true)
          else locals.sendResponse(res, 200, 'Something wrong please try again')
        } else locals.sendResponse(res, 200, 'account is not active')
      }
    } else locals.sendResponse(res, 200, 'User Not Found')
  } else locals.sendResponse(res, 200, 'bad user information')
})
router.post('/Insert', async function (req, res) {
  const { UserName, Email, FirstName, LastName, Password } = req.body
  const locals = req.app.locals
  if (Validate('Email', Email) && Validate('Password', Password) && Validate('Username', UserName.trim()) && Validate('Name', LastName.trim()) && Validate('Name', FirstName.trim())) {
    const result = await locals.checkUserExist({ Email, UserName })
    if (result === true) {
      const userInfo = {
        UserName: UserName.trim(),
        Email,
        FirstName: FirstName.trim(),
        LastName: LastName.trim(),
        Password: md5(Password),
        Token: locals.crypto.randomBytes(64).toString('hex'),
        IsActive: 0,
      }
      const resultInsert = await locals.insert('Users', userInfo)
      if (resultInsert) {
        locals.sendMail('Activate your email address', 'to Activate your email address', userInfo.Email, userInfo.UserName, `${process.env.CLIENT_PROTOCOL}://${req.headers.host}/Users/Active/${userInfo.Token}`)
        locals.sendResponse(res, 200, 'successful')
      } else locals.sendResponse(res, 200, 'Error')
    } else locals.sendResponse(res, 200, 'user information already taken')
  } else locals.sendResponse(res, 200, 'bad user information')
})
function checkAllImages(images, locals) {
  return new Promise((resolve) => {
    const arr = []
    let imageList = []
    let imageCheck = true
    if (images.length !== 0)
      images.forEach(async (image) => {
        const base64Data = await locals.checkImage(image.src, locals)
        if (base64Data) {
          imageList[0] = image.default === 1 ? base64Data : imageList[0]
          image.default !== 1 ? imageList.push(base64Data) : null
          arr.push('ok')
        } else {
          arr.push('ko')
          imageCheck = false
        }
        if (arr.length === images.length) resolve([imageList, imageCheck])
      })
    else resolve([[], true])
  })
}
router.post('/CompleteInsert', auth, async function (req, res) {
  const { step1, step2, step3, step4, step5 } = req.body
  const locals = req.app.locals
  if (
    req.userInfo.IsActive === 2 &&
    (step1, step2, step3, step4, step5) &&
    step5 instanceof Array &&
    step4.yourInterest instanceof Array &&
    step4.yourInterest.length <= 5 &&
    step4.yourInterest.length !== 0 &&
    typeof step4.DescribeYourself === 'string' &&
    step4.DescribeYourself.trim() &&
    step4.yourInterest.every((Interest) => Interest.length >= 2 && Interest.length <= 25) &&
    (step5.length === 0 || (step5.every((image) => image.default === 0 || image.default === 1) && step5.length <= 5 && step5.filter((image) => image.default === 1).length == 1)) &&
    isValidDate(step1) &&
    step4.DescribeYourself.trim().length <= 100 &&
    step4.DescribeYourself.trim().length !== 0 &&
    getAge(step1) >= 18 &&
    getAge(step1) <= 80 &&
    (step3.youGender === 'Male' || step3.youGender === 'Female' || step3.youGender === 'Other') &&
    step3.genderYouAreLooking.toString().replace(',', ' ').trim() &&
    ((parseFloat(step2.latitude) <= 90 && parseFloat(step2.latitude) >= -90 && parseFloat(step2.longitude) <= 180 && parseFloat(step2.longitude) >= -180) || (step2.ip && step2.ip !== '' && (await locals.checkIp(step2.ip)))) &&
    (step3.genderYouAreLooking.toString().replace(',', ' ').trim() === 'Male' ||
      step3.genderYouAreLooking.toString().replace(',', ' ').trim() === 'Female' ||
      step3.genderYouAreLooking.toString().replace(',', ' ').trim() === 'Female Male' ||
      step3.genderYouAreLooking.toString().replace(',', ' ').trim() === 'Male Female')
  ) {
    const [imageList, imageCheck] = await checkAllImages(step5, locals)
    if (imageCheck) {
      let Latitude, Longitude
      if (parseFloat(step2.latitude) <= 90 && parseFloat(step2.latitude) >= -90 && parseFloat(step2.longitude) <= 180 && parseFloat(step2.longitude) >= -180) {
        Latitude = step2.latitude
        Longitude = step2.longitude
        const needed = {
          Token: req.userInfo.Token,
        }
        const values = {
          DataBirthday: step1,
          Biography: step4.DescribeYourself.trim(),
          Gender: step3.youGender.trim(),
          Sexual: step3.genderYouAreLooking.toString().replace(',', ' ').trim(),
          Images: JSON.stringify(imageList),
          ListInterest: JSON.stringify(step4.yourInterest),
          IsActive: 1,
          Latitude,
          Longitude,
        }
        const result = await locals.update('Users', { ...values }, needed)
        if (result) locals.sendResponse(res, 200, values)
        else locals.sendResponse(res, 200, 'Something wrong With your images')
      } else if (await locals.checkIp(step2.ip)) {
        position = await locals.fetchDataJSON(step2.ip)
        Longitude = position.Longitude
        Latitude = position.Latitude
        const needed = {
          Token: req.userInfo.Token,
        }
        const values = {
          DataBirthday: step1,
          Biography: step4.DescribeYourself.trim(),
          Gender: step3.youGender.trim(),
          Sexual: step3.genderYouAreLooking.toString().replace(',', ' ').trim(),
          Images: JSON.stringify(imageList),
          ListInterest: JSON.stringify(step4.yourInterest),
          IsActive: 1,
          Latitude,
          Longitude,
        }
        const result = await locals.update('Users', { ...values }, needed)
        if (result) locals.sendResponse(res, 200, values)
        else locals.sendResponse(res, 200, 'Something wrong With your images')
      } else locals.sendResponse(res, 200, 'bad user information')
    } else locals.sendResponse(res, 200, 'Something wrong With your images')
  } else locals.sendResponse(res, 200, 'bad user information')
})

module.exports = { Authentication: router, auth }
