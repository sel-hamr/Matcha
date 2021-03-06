const express = require('express')
const router = express.Router()
const { Validate, isValidDate, getAge } = require('../tools/validate')
const md5 = require('md5')
const haversine = require('haversine-distance')
const { auth } = require('./Authentication')
router.post('/EditInfoUser', auth, async function (req, res) {
  const locals = req.app.locals
  let { UserName, Email, FirstName, LastName, DataBirthday, Biography, Sexual, Gender, ListInterest } = req.body
  if (
    (UserName, Email, FirstName, LastName, FirstName, DataBirthday, Sexual, Gender, ListInterest) &&
    Validate('Username', UserName) &&
    Validate('Email', Email) &&
    Validate('Name', FirstName) &&
    Validate('Name', LastName) &&
    isValidDate(DataBirthday) &&
    getAge(DataBirthday) >= 18 &&
    getAge(DataBirthday) <= 80 &&
    Biography &&
    Biography.length <= 100 &&
    (Sexual.trim() === 'Male' || Sexual.trim() === 'Female' || Sexual.trim() === 'Female Male' || Sexual.trim() === 'Male Female') &&
    (Gender.trim() === 'Male' || Gender.trim() === 'Female' || Gender.trim() === 'Other') &&
    ListInterest instanceof Array &&
    ListInterest.length &&
    ListInterest.every((Interest) => Interest.length !== 1 && Interest.length <= 25) &&
    ListInterest.length <= 5
  ) {
    ListInterest = JSON.stringify(ListInterest)
    Sexual = Sexual.trim()
    Gender = Gender.trim()
    const userReadyTake = await locals.query('select COUNT(*) As COUNT from Users WHERE UserName=?', UserName)
    const EmailReadyTake = await locals.query('select COUNT(*) As COUNT from Users WHERE Email=?', Email)
    if ((userReadyTake[0].COUNT !== 1 || req.userInfo.UserName === UserName) && (EmailReadyTake[0].COUNT !== 1 || req.userInfo.Email === Email)) {
      const needed = {
        Token: req.userInfo.Token,
      }
      const info = await locals.select('Users', ['UserName', 'Email', 'FirstName', 'LastName', 'DataBirthday', 'Biography', 'Sexual', 'Gender', 'ListInterest'], { Token: req.userInfo.Token })
      if (JSON.stringify({ ...info[0], DataBirthday: DataBirthday.split('T')[0] }) === JSON.stringify({ UserName, Email, FirstName, LastName, DataBirthday, Biography, Sexual, Gender, ListInterest })) res.send('NoUpdate')
      else {
        const result = await locals.update('Users', { UserName, Email, FirstName, LastName, DataBirthday, Biography, Sexual, Gender, ListInterest }, needed)
        if (result) locals.sendResponse(res, 200, 'successful')
        else locals.sendResponse(res, 200, 'Something wrong')
      }
    } else locals.sendResponse(res, 200, 'Something wrong')
  } else locals.sendResponse(res, 200, 'Something wrong')
})

router.post('/AddImage', auth, async function (req, res) {
  const locals = req.app.locals
  const image = req.body.image
  const NewImage = await locals.checkImage(image, locals)
  if (NewImage) {
    let ImagesUser = await locals.getImage(req.userInfo.Token, locals)
    if (JSON.parse(ImagesUser[0].Images).length < 5) {
      let newImages = [...JSON.parse(ImagesUser[0].Images), NewImage]
      const needed = {
        Token: req.userInfo.Token,
      }
      const values = {
        Images: JSON.stringify(newImages),
      }
      await locals.update('Users', values, needed)
      locals.sendResponse(res, 200, NewImage, true)
    } else locals.sendResponse(res, 200, 'or')
  } else locals.sendResponse(res, 200, 'Error')
})
router.post('/DeleteImage', auth, async function (req, res) {
  const locals = req.app.locals
  let ImagesUser = await locals.getImage(req.userInfo.Token, locals)
  if (req.body.index >= 0 && JSON.parse(ImagesUser[0].Images)[req.body.index]) {
    let array = JSON.parse(ImagesUser[0].Images)
    array.splice(req.body.index, 1)
    const needed = {
      Token: req.userInfo.Token,
    }
    const values = {
      Images: JSON.stringify(array),
    }
    await locals.update('Users', values, needed)
    locals.sendResponse(res, 200, req.body, true)
  } else locals.sendResponse(res, 200, 'Something wrong')
})
router.post('/MakeImageDefault', auth, async function (req, res) {
  const locals = req.app.locals
  let ImagesUser = await locals.getImage(req.userInfo.Token, locals)
  let arrayImage = await JSON.parse(ImagesUser[0].Images)
  if (arrayImage && req.body.index && req.body.index > 0 && arrayImage[req.body.index]) {
    ;[arrayImage[0], arrayImage[req.body.index]] = [arrayImage[req.body.index], arrayImage[0]]
    const needed = {
      Token: req.userInfo.Token,
    }
    const values = {
      Images: JSON.stringify(arrayImage),
    }
    await locals.update('Users', values, needed)
    locals.sendResponse(res, 200, req.body, true)
  } else locals.sendResponse(res, 200, 'Something wrong')
})
router.post('/ChangePasswordProfile', auth, async function (req, res) {
  const locals = req.app.locals
  const password = await locals.getPassword(req.userInfo.Token, locals)
  if (req.body.CurrentPassword && req.body.NewPassword && req.body.ConfirmPassword === req.body.NewPassword && Validate('Password', req.body.NewPassword) && md5(req.body.CurrentPassword) === password[0].Password) {
    const needed = {
      Token: req.userInfo.Token,
    }
    const values = {
      Password: md5(req.body.NewPassword),
    }
    const result = await locals.update('Users', values, needed)
    if (result) res.send('succuss Update Password')
    else res.send('failed')
  } else res.send('failed')
})
router.get('/GetUser/:userName', auth, async function (req, res) {
  const locals = req.app.locals
  if (req.params.userName) {
    const IdUserReceiver = await locals.getIdUserOwner(req.params.userName)
    if (IdUserReceiver) {
      const ifNotBlock = await locals.ifNotBlock(req.userInfo.IdUserOwner, IdUserReceiver, locals)
      if (ifNotBlock) {
        const result = await locals.select('Users', ['FirstName', 'UserName', 'Email', 'DataBirthday', 'LastName', 'Gender', 'Sexual', 'Biography', 'ListInterest', 'Images', 'LastLogin', 'Active', 'Latitude', 'Longitude'], {
          UserName: req.params.userName,
          IsActive: 1,
        })
        if (result[0]) {
          const YourRating = await locals.getRating(req.params.userName, locals)
          const MyRating = await locals.myRating(req.params.userName, req.userInfo.UserName, locals)
          const CountRating = await locals.CountRating(req.params.userName, locals)
          const CountFriends = await locals.query('SELECT COUNT(*) As Count FROM Friends WHERE (IdUserOwner=? OR IdUserReceiver=?) AND `Match`=1', [IdUserReceiver, IdUserReceiver])
          const CheckFriends = await locals.query('select Count(*) As Count From  Friends WHERE (IdUserOwner=? AND IdUserReceiver=?) Or (IdUserOwner=? AND IdUserReceiver=?) AND `Match`=1', [req.userInfo.IdUserOwner, IdUserReceiver, IdUserReceiver, req.userInfo.IdUserOwner])
          const Distance = haversine({ lat: result[0].Latitude, lng: result[0].Longitude }, { lat: req.userInfo.Latitude, lng: req.userInfo.Longitude })
          const IfHaveImage = await locals.getImage(req.userInfo.Token, locals)
          const values = { ...result[0], YourRating, CountRating, CountFriends: CountFriends[0].Count, CheckFriends: CheckFriends[0].Count, MyRating, Distance, IfHaveImage: JSON.parse(IfHaveImage[0].Images).length === 0 ? false : true }

          if (result[0].UserName !== req.userInfo.UserName) locals.notification(req, 'View', req.userInfo.UserName, req.params.userName)
          locals.sendResponse(res, 200, values)
        } else locals.sendResponse(res, 200, 'User not found')
      } else locals.sendResponse(res, 200, 'User not found')
    } else locals.sendResponse(res, 200, 'User not found')
  } else locals.sendResponse(res, 200, 'User not found')
})
router.post('/CheckProfileOfYou/:userName', auth, async function (req, res) {
  const locals = req.app.locals
  const IdUserReceiver = await locals.getIdUserOwner(req.params.userName)
  if (IdUserReceiver) {
    const ifNotBlock = await locals.ifNotBlock(req.userInfo.IdUserOwner, IdUserReceiver, locals)
    if (ifNotBlock) {
      const ProfileOfYou = await locals.checkProfileOfYou(req.userInfo.Token, req.params.userName, locals)
      const result = await locals.checkUserNotReport({
        IdUserOwner: req.userInfo.IdUserOwner,
        IdUserReceiver: IdUserReceiver,
      })
      res.send({ isProfileOfYou: ProfileOfYou, isNotReport: result })
    } else res.send({ isProfileOfYou: 'User not found', isNotReport: false })
  } else res.send({ isProfileOfYou: 'User not found', isNotReport: false })
})
router.get('/BlockUser/:userName', auth, async function (req, res) {
  const locals = req.app.locals
  const IdUserReceiver = await locals.getIdUserOwner(req.params.userName)
  if (IdUserReceiver) {
    const ifNotBlock = await locals.ifNotBlock(req.userInfo.IdUserOwner, IdUserReceiver, locals)
    if (ifNotBlock) {
      const values = {
        IdUserOwner: req.userInfo.IdUserOwner,
        IdUserReceiver: IdUserReceiver,
      }
      locals.notification(req, 'removeFriend', req.userInfo.UserName, req.params.userName)
      const resultInsert = await locals.insert('Blacklist', values)
      if (resultInsert) {
        await locals.query('DELETE FROM Friends WHERE (IdUserOwner=? AND IdUserReceiver=?) Or (IdUserOwner=? AND IdUserReceiver=?)', [req.userInfo.IdUserOwner, IdUserReceiver, IdUserReceiver, req.userInfo.IdUserOwner])
        await locals.query('DELETE FROM History WHERE (IdUserOwner=? AND IdUserReceiver=?) Or (IdUserOwner=? AND IdUserReceiver=?)', [req.userInfo.IdUserOwner, IdUserReceiver, IdUserReceiver, req.userInfo.IdUserOwner])
        await locals.query('DELETE FROM Notifications WHERE (IdUserOwner=? AND IdUserReceiver=?) Or (IdUserOwner=? AND IdUserReceiver=?)', [req.userInfo.IdUserOwner, IdUserReceiver, IdUserReceiver, req.userInfo.IdUserOwner])
        await locals.query('DELETE FROM Rating WHERE (IdUserOwner=? AND IdUserReceiver=?) Or (IdUserOwner=? AND IdUserReceiver=?)', [req.userInfo.IdUserOwner, IdUserReceiver, IdUserReceiver, req.userInfo.IdUserOwner])
        await locals.query('DELETE FROM Messages WHERE (IdUserOwner=? AND IdUserReceiver=?) Or (IdUserOwner=? AND IdUserReceiver=?)', [req.userInfo.IdUserOwner, IdUserReceiver, IdUserReceiver, req.userInfo.IdUserOwner])
        locals.sendResponse(res, 200, 'successful')
      } else locals.sendResponse(res, 200, 'Error')
    } else locals.sendResponse(res, 200, 'Error')
  } else locals.sendResponse(res, 200, 'Error')
})

router.get('/ReportUser/:userName', auth, async function (req, res) {
  const locals = req.app.locals
  const IdUserReceiver = await locals.getIdUserOwner(req.params.userName)
  if (IdUserReceiver) {
    const ifNotBlock = await locals.ifNotBlock(req.userInfo.IdUserOwner, IdUserReceiver, locals)
    const checkUserNotReport = await locals.checkUserNotReport({
      IdUserOwner: req.userInfo.IdUserOwner,
      IdUserReceiver: IdUserReceiver,
    })
    if (ifNotBlock && checkUserNotReport) {
      const values = {
        IdUserOwner: req.userInfo.IdUserOwner,
        IdUserReceiver: IdUserReceiver,
      }
      const resultInsert = await locals.insert('report', values)
      if (resultInsert) {
        const value = {
          IdUserOwner: req.userInfo.IdUserOwner,
          IdUserReceiver: IdUserReceiver,
          Content: `You report ${req.params.userName}`,
        }
        const resultInsert = await locals.insert('History', value)
        if (resultInsert) locals.sendResponse(res, 200, 'successful')
        else locals.sendResponse(res, 200, 'Error')
      } else locals.sendResponse(res, 200, 'Error')
    } else locals.sendResponse(res, 200, 'Error')
  } else locals.sendResponse(res, 200, 'Error')
})
router.post('/UserReadyTake', auth, async function (req, res) {
  const locals = req.app.locals
  if (locals.Validate('Username', req.body.UserName)) {
    const userReadyTake = await locals.query('select COUNT(*) As COUNT from Users WHERE UserName=?', req.body.UserName)
    if (userReadyTake[0].COUNT === 0 || req.userInfo.UserName === req.body.UserName) res.send(true)
    else res.send(false)
  } else res.send('Error')
})
router.post('/EmailReadyTake', auth, async function (req, res) {
  const locals = req.app.locals
  if (locals.Validate('Email', req.body.Email)) {
    const EmailReadyTake = await locals.query('select COUNT(*) As COUNT from Users WHERE Email=?', req.body.Email)
    if (EmailReadyTake[0].COUNT !== 1 || req.userInfo.Email === req.body.Email) res.send(true)
    else res.send(false)
  } else res.send('Error')
})
router.post('/DeleteMyAccount', auth, async function (req, res) {
  const locals = req.app.locals
  await locals.query('DELETE FROM Friends WHERE (IdUserOwner=? Or IdUserReceiver=?)', [req.userInfo.IdUserOwner, req.userInfo.IdUserOwner])
  await locals.query('DELETE FROM History WHERE (IdUserOwner=? Or IdUserReceiver=?)', [req.userInfo.IdUserOwner, req.userInfo.IdUserOwner])
  await locals.query('DELETE FROM Notifications WHERE (IdUserOwner=? Or IdUserReceiver=?)', [req.userInfo.IdUserOwner, req.userInfo.IdUserOwner])
  await locals.query('DELETE FROM Messages WHERE (IdUserOwner=? Or IdUserReceiver=?)', [req.userInfo.IdUserOwner, req.userInfo.IdUserOwner])
  await locals.query('DELETE FROM report WHERE (IdUserOwner=? Or IdUserReceiver=?)', [req.userInfo.IdUserOwner, req.userInfo.IdUserOwner])
  await locals.query('DELETE FROM Rating WHERE (IdUserOwner=? Or IdUserReceiver=?)', [req.userInfo.IdUserOwner, req.userInfo.IdUserOwner])
  await locals.query('DELETE FROM Blacklist WHERE (IdUserOwner=? Or IdUserReceiver=?)', [req.userInfo.IdUserOwner, req.userInfo.IdUserOwner])
  await locals.query('DELETE FROM Users WHERE IdUserOwner=? ', [req.userInfo.IdUserOwner])
  res.send('Delete success')
})
router.post('/UpdatePosition', auth, async function (req, res) {
  const locals = req.app.locals
  let Latitude, Longitude
  if (parseFloat(req.body.latitude) <= 90 && parseFloat(req.body.latitude) >= -90 && parseFloat(req.body.longitude) <= 180 && parseFloat(req.body.longitude) >= -180) {
    Latitude = req.body.latitude
    Longitude = req.body.longitude
    const result = await locals.update(
      'Users',
      { Longitude, Latitude },
      {
        Token: req.userInfo.Token,
      }
    )
    res.send(result)
  } else if (req.body.ip && (await locals.checkIp(req.body.ip))) {
    try {
      position = await locals.fetchDataJSON(req.body.ip)
      Longitude = position.Longitude
      Latitude = position.Latitude
      const result = await locals.update(
        'Users',
        { Longitude, Latitude },
        {
          Token: req.userInfo.Token,
        }
      )
      res.send(result)
    } catch (error) {
      res.send('error')
    }
  } else res.send('error')
})

module.exports = router
