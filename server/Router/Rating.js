const express = require('express')
const router = express.Router()
const { checkIfHasOneImage } = require('../tools/tools')
router.post('/', checkIfHasOneImage, async (req, res) => {
  const locals = req.app.locals
  const { usernameReceiver, RatingValue } = req.body
  if (locals.Validate('Username', usernameReceiver) && usernameReceiver !== req.userInfo.UserName && RatingValue && RatingValue >= 0 && RatingValue <= 5) {
    const IdUserReceiver = await locals.getIdUserOwner(usernameReceiver)
    const ifNotBlock = await locals.ifNotBlock(IdUserReceiver, req.userInfo.IdUserOwner, locals)
    if (IdUserReceiver && ifNotBlock) {
      const resultCheckRating = await locals.select('Rating', '*', {
        IdUserOwner: req.userInfo.IdUserOwner,
        IdUserReceiver,
      })
      if (resultCheckRating.length > 0) await locals.update('Rating', { RatingValue }, { IdUserOwner: req.userInfo.IdUserOwner, IdUserReceiver })
      else await locals.insert('Rating', { IdUserOwner: req.userInfo.IdUserOwner, IdUserReceiver, RatingValue })
      const result = await locals.select('Rating', ['SUM(RatingValue)/COUNT(RatingValue) "AVG"', 'COUNT(RatingValue) "CountReview"'], { IdUserReceiver })
      locals.notification(req, 'Rate', req.userInfo.UserName, usernameReceiver)
      locals.sendResponse(res, 200, result.length > 0 ? { AVG: result[0].AVG, CountReview: result[0].CountReview } : { AVG: 0, CountReview: 0 }, true)
    } else locals.sendResponse(res, 200, 'UserName is wrong')
  } else locals.sendResponse(res, 200, 'Bad Request')
})
router.get('/myRating/:usernameReceiever', async (req, res) => {
  const locals = req.app.locals
  if (req.params && locals.Validate('Username', req.params.usernameReceiever)) {
    const IdUserReceiver = await locals.getIdUserOwner(req.params.usernameReceiever)
    const RatingValue = await locals.select('Rating', 'RatingValue', { IdUserOwner: req.userInfo.UserName, IdUserReceiver })
    if (RatingValue.length > 0) locals.sendResponse(res, 200, RatingValue[0].RatingValue.toString())
    else locals.sendResponse(res, 200, 'Wrong UserName')
  } else locals.sendResponse(res, 200, 'bad request')
})
module.exports = router
