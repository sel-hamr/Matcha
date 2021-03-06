const express = require('express')
const router = express.Router()
const { auth } = require('./Authentication')

router.get('/', auth, async function (req, res) {
  const locals = req.app.locals
  const userBlock = await locals.selectHistory(req.userInfo.IdUserOwner)
  locals
    .getImageProfile(userBlock)
    .then(() => {
      res.send(userBlock)
    })
    .catch(() => {
      res.send('Error')
    })
})

router.post('/SearchHistory', auth, async function (req, res) {
  const locals = req.app.locals
  const userBlock = await locals.searchHistory(req.userInfo.IdUserOwner, req.body.UserName)
  locals
    .getImageProfile(userBlock)
    .then(() => {
      res.send(userBlock)
    })
    .catch(() => {
      res.send('Error')
    })
})
module.exports = router
