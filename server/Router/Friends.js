const express = require('express')
const router = express.Router()
const { checkIfHasOneImage } = require('../tools/tools')

router.get('/', checkIfHasOneImage, async (req, res) => {
  const locals = req.app.locals
  const result = await locals.query(
    'SELECT u.IdUserOwner,u.Images,u.UserName,u.LastLogin,u.Active,(SELECT IdBlackList FROM Blacklist WHERE (IdUserReceiver =? AND IdUserOwner=u.IdUserOwner) OR (IdUserReceiver =u.IdUserOwner AND IdUserOwner=?)) AS blacklist FROM Users u,Friends f WHERE f.Match=1 AND ((f.IdUserOwner=? AND u.IdUserOwner = f.IdUserReceiver) OR (f.IdUserReceiver=? AND u.IdUserOwner = f.IdUserOwner)) HAVING blacklist IS NULL',
    [req.userInfo.IdUserOwner, req.userInfo.IdUserOwner, req.userInfo.IdUserOwner, req.userInfo.IdUserOwner]
  )
  if (result.length > 0) {
    const resultObject = {}
    let count = 0
    result.map(async (item, index) => {
      const messages = await locals.query('SELECT IdMessages As "id",IdUserOwner,Content,DateCreation As "date" FROM Messages WHERE (IdUserOwner=? AND idUserReceiver=?) OR (IdUserOwner=? AND IdUserReceiver=?) ORDER BY DateCreation DESC LIMIT 30', [
        req.userInfo.IdUserOwner,
        item.IdUserOwner,
        item.IdUserOwner,
        req.userInfo.IdUserOwner,
      ])
      const messagesReversed = messages.reverse()
      const IsRead = await locals.select('Messages', 'COUNT(*) AS IsRead', {
        IsRead: 0,
        IdUserOwner: item.IdUserOwner,
        IdUserReceiver: req.userInfo.IdUserOwner,
      })
      resultObject[result[index].UserName] = {
        ...item,
        Images: JSON.parse(item.Images)[0],
        messages: messagesReversed.length < 30 ? ['limit', ...messagesReversed] : messagesReversed,
        IsRead: IsRead.length > 0 ? IsRead[0].IsRead : 0,
      }
      count++
      if (count === result.length) locals.sendResponse(res, 200, resultObject, true)
    })
  } else locals.sendResponse(res, 200, 'bad request')
})

router.post('/Invite', checkIfHasOneImage, async (req, res) => {
  const { UserName } = req.body
  const locals = req.app.locals
  if (locals.Validate('Username', UserName)) {
    const IdUserOwner = await locals.getIdUserOwner(UserName)
    const ifNotBlock = await locals.ifNotBlock(IdUserOwner, req.userInfo.IdUserOwner, locals)
    if (IdUserOwner && IdUserOwner !== req.userInfo.IdUserOwner && ifNotBlock) {
      const checkFriends = await locals.query('SELECT * FROM Friends WHERE (IdUserOwner=? AND IdUserReceiver=?) OR (IdUserOwner=? AND IdUserReceiver=?)', [req.userInfo.IdUserOwner, IdUserOwner, IdUserOwner, req.userInfo.IdUserOwner])
      if (checkFriends && checkFriends.length > 0) {
        const UserOwner = checkFriends[0].IdUserOwner === req.userInfo.IdUserOwner ? req.userInfo.UserName : UserName
        const UserReceiver = UserOwner === UserName ? req.userInfo.UserName : UserName
        if (checkFriends[0].IdUserOwner === req.userInfo.IdUserOwner && checkFriends[0].Match) {
          locals.notification(req, 'Unlike', UserOwner, UserReceiver)
          locals.update(
            'Friends',
            {
              IdUserOwner: checkFriends[0].IdUserReceiver,
              IdUserReceiver: checkFriends[0].IdUserOwner,
              Match: 0,
            },
            {
              IdUserOwner: checkFriends[0].IdUserOwner,
              IdUserReceiver: checkFriends[0].IdUserReceiver,
            }
          )
        }
        if (checkFriends[0].IdUserReceiver === req.userInfo.IdUserOwner && checkFriends[0].Match) {
          locals.notification(req, 'Unlike', UserReceiver, UserOwner)
          locals.update(
            'Friends',
            { Match: 0 },
            {
              IdUserOwner: checkFriends[0].IdUserOwner,
              IdUserReceiver: checkFriends[0].IdUserReceiver,
            }
          )
        } else if (checkFriends[0].IdUserOwner === req.userInfo.IdUserOwner && !checkFriends[0].Match) {
          locals.notification(req, 'Unlike', UserOwner, UserReceiver)
          locals.delete('Friends', {
            IdUserOwner: checkFriends[0].IdUserOwner,
            IdUserReceiver: checkFriends[0].IdUserReceiver,
          })
        } else if (checkFriends[0].IdUserReceiver === req.userInfo.IdUserOwner && !checkFriends[0].Match) {
          locals.notification(req, 'LikedBack', UserReceiver, UserOwner)
          locals.notification(req, 'addFriend', UserOwner, UserReceiver)
          locals.update(
            'Friends',
            { Match: 1 },
            {
              IdUserOwner: checkFriends[0].IdUserOwner,
              IdUserReceiver: checkFriends[0].IdUserReceiver,
            }
          )
        }
        locals.sendResponse(res, 200, 'Friend has been updated')
      } else {
        locals.notification(req, 'Like', req.userInfo.UserName, UserName)
        locals.insert('Friends', {
          IdUserOwner: req.userInfo.IdUserOwner,
          IdUserReceiver: IdUserOwner,
        })
        locals.sendResponse(res, 200, 'Friend has been created')
      }
    } else locals.sendResponse(res, 200, 'UserName is wrong')
  } else locals.sendResponse(res, 200, 'Bad Request')
})

module.exports = router
