const express = require('express')
const router = express.Router()

router.get('/readMessages/:UserName', async (req, res) => {
  const locals = req.app.locals
  if (req.params && locals.Validate('Username', req.params.UserName) && req.userInfo.UserName !== req.params.UserName) {
    const IdUserOwner = await locals.getIdUserOwner(req.params.UserName)
    if (IdUserOwner) locals.update('Messages', { IsRead: 1 }, { IdUserOwner, IdUserReceiver: req.userInfo.IdUserOwner })
    locals.sendResponse(res, 200, 'all messages is readed')
  } else locals.sendResponse(res, 200, 'Wrong UserName')
})
router.get('/deleteMessage/:id', async (req, res) => {
  if (req.params.id > 0) {
    req.app.locals.delete('Messages', {
      IdUserOwner: req.userInfo.IdUserOwner,
      IdMessages: req.params.id,
    })
    req.app.locals.sendResponse(res, 200, 'message deleted')
  } else req.app.locals.sendResponse(res, 200, 'bad request')
})

router.get('/:UserName/:index', async (req, res) => {
  const locals = req.app.locals
  if (req.params && locals.Validate('Username', req.params.UserName) && req.userInfo.UserName !== req.params.UserName) {
    req.params.index = req.params.index && parseInt(req.params.index) > 0 ? parseInt(req.params.index) : 0
    const IdUserReceiver = await locals.getIdUserOwner(req.params.UserName)
    const messages = await locals.query('SELECT * FROM Messages WHERE (IdUserOwner=? AND IdUserReceiver=?) OR (IdUserOwner=? AND IdUserReceiver=?) ORDER BY `DateCreation` DESC LIMIT ?,?', [req.userInfo.IdUserOwner, IdUserReceiver, IdUserReceiver, req.userInfo.IdUserOwner, req.params.index, 30])
    const arr = []
    if (messages.length > 0)
      messages.map((item) =>
        arr.push({
          id: item.IdMessages,
          IdUserOwner: item.IdUserOwner,
          date: item.DateCreation.toISOString(),
          Content: item.Content,
        })
      )
    if (arr.length < 24) arr.push('limit')
    arr.reverse()
    locals.sendResponse(res, 200, arr, true)
  } else locals.sendResponse(res, 200, 'Wrong UserName')
})
module.exports = router
