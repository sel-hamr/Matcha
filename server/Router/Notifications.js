const express = require('express')
const router = express.Router()

router.get('/readNotifications', (req, res) => {
  const locals = req.app.locals
  locals.update('Notifications', { IsRead: 1 }, { IdUserReceiver: req.userInfo.IdUserOwner })
  locals.sendResponse(res, 200, 'Notification Readed')
})

router.get('/:start', async (req, res) => {
  const locals = req.app.locals
  if (req.params.start >= 0) {
    const result = await locals.query(
      'SELECT u.UserName,u.Images,n.IdNotification,n.IdUserReceiver,n.IdUserOwner,n.Type,n.DateCreation,(SELECT IdBlackList FROM Blacklist WHERE (IdUserReceiver =? AND IdUserOwner=u.IdUserOwner) OR (IdUserReceiver =u.IdUserOwner AND IdUserOwner=?)) AS blacklist FROM Users u,Notifications n WHERE u.IdUserOwner = n.IdUserOwner AND n.IdUserReceiver=? HAVING blacklist IS NULL ORDER BY n.DateCreation DESC LIMIT ?,30',
      [req.userInfo.IdUserOwner, req.userInfo.IdUserOwner, req.userInfo.IdUserOwner, parseInt(req.params.start)]
    )
    if (result.length > 0) {
      const IsRead = await locals.query('SELECT COUNT(*) AS IsRead FROM Notifications WHERE IsRead = 0 AND IdUserReceiver=?', [req.userInfo.IdUserOwner])
      result.map((item, index) => {
        item.Images = JSON.parse(item.Images)[0]
        if (index + 1 === result.length) {
          if (result.length !== 30) result.push('limit')
          locals.sendResponse(res, 200, { data: result, IsRead: IsRead.length > 0 ? IsRead[0].IsRead : 0 }, true)
        }
      })
    } else locals.sendResponse(res, 200, 'None')
  } else locals.sendResponse(res, 200, 'Bad request')
})
module.exports = router
