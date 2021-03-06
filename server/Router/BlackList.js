const express = require('express')
const router = express.Router()
const { auth } = require('./Authentication')

router.get('/', auth, async function (req, res) {
  const locals = req.app.locals
  const userBlock = await locals.selectUsersBlocks(req.userInfo.IdUserOwner)
  locals
    .getImageProfile(userBlock)
    .then((result) => {
      res.send(userBlock)
    })
    .catch(() => {
      res.send('Error')
    })
})
router.post('/Unblock', auth, async function (req, res) {
  const locals = req.app.locals
  if (req.body.UserName) {
    const id = await locals.getIdUserOwner(req.body.UserName)
    const result = await locals.delete('Blacklist', {
      IdUserOwner: req.userInfo.IdUserOwner,
      IdUserReceiver: id,
    })
    if (result) {
      res.send(result)
    } else res.send('Error')
  } else res.send('Error')
})
router.post('/SearchUserBlock', auth, async function (req, res) {
  const locals = req.app.locals
  const userBlock = await locals.searchUsersBlocks(req.userInfo.IdUserOwner, req.body.UserName)
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
