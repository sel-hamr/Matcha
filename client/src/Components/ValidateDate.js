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

export { getAge, isValidDate }
