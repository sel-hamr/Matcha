import Jimp from 'jimp'
function Validate(name, value) {
  const list = {
    // eslint-disable-next-line
    Name: /^[a-zA-Z0-9]{2,30}$/g.test(value) && value, // eslint-disable-next-line
    Username: /^[a-zA-Z0-9]{2,15}[\-\_\.]{0,1}[a-zA-Z0-9]{2,15}$/g.test(value) && value, // eslint-disable-next-line
    Email: /^[a-zA-Z0-9]{1,10}[\-\_\.]{0,1}[a-zA-Z0-9]{1,10}@[a-zA-Z0-9]{1,5}[\-\_]{0,1}[a-zA-Z0-9]{1,5}.[a-zA-Z0-9]{1,5}[\.]{0,1}[a-zA-Z0-9]{1,5}$/g.test(value) && value, // eslint-disable-next-line
    Password: /^[ -~]{8,30}$/g.test(value) && value,
  }
  return list[name]
}
function checkImages(images) {
  return new Promise((resolve) => {
    let arr = []
    if (images.length > 0)
      images.forEach((image) => {
        let base64Data = image.split(',')
        if (base64Data.length > 1) {
          const buffer = Buffer.from(base64Data[1], 'base64')
          Jimp.read(buffer, (err, res) => {
            if (err) {
              resolve(false)
            } else {
              arr.push('ok')
            }
            if (arr.length === images.length) resolve(true)
          })
        } else resolve(false)
      })
    else resolve(false)
  })
}
function getAge(dateString) {
  let today = new Date()
  let birthDate = new Date(dateString)
  let age = today.getFullYear() - birthDate.getFullYear()
  let m = today.getMonth() - birthDate.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
}
function isValidDate(dateString) {
  let regex_date = /^\d{4}-\d{1,2}-\d{1,2}$/

  if (!regex_date.test(dateString)) {
    return false
  }
  let parts = dateString.split('-')
  let day = parseInt(parts[2], 10)
  let month = parseInt(parts[1], 10)
  let year = parseInt(parts[0], 10)
  if (year < 1000 || year > 3000 || month === 0 || month > 12) {
    return false
  }
  let monthLength = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  if (year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0)) {
    monthLength[1] = 29
  }
  return day > 0 && day <= monthLength[month - 1]
}

export { Validate, checkImages, getAge, isValidDate }
