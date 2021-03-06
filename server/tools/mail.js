const nodemailer = require('nodemailer')
require('dotenv').config({
  path: __dirname + '/../.env',
})

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_PASS,
  },
})
function sendMail(subject, message, email, username, url) {
  const mailResult = {
    error: null,
    result: null,
  }
  const mailOptions = {
    from: process.env.NODEMAILER_EMAIL,
    to: email,
    subject: subject,
    html: `<div><p>Hey ${username} </p>
            <p>please <a href="${url}"> Click here</a>${message}</p>
            </div>`,
  }
  transporter.sendMail(mailOptions, function (error, info) {
    mailResult.error = error
    mailResult.result = info
  })
  return mailResult
}
module.exports = {
  sendMail,
}
