const mysql = require('mysql')
const mysqlObject = require('../tools/mysql')
const data = require('./Users.json')
const fs = require('fs')
require('dotenv').config({
  path: __dirname + '/../.env',
})
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  multipleStatements: true,
})
async function insertData() {
  for (let i = 0; i < data.length; i++) {
    await mysqlObject.insert('Users', {
      UserName: data[i].Username,
      Email: data[i].Email,
      FirstName: data[i].FirstName,
      LastName: data[i].LastName,
      Password: data[i].Password,
      DataBirthday: data[i].DataBirthday,
      Latitude: data[i].Location.lat,
      Longitude: data[i].Location.lon,
      City: data[i].City,
      Gender: data[i].Gender,
      Sexual: data[i].Sexual,
      Biography: data[i].Biography,
      Token: data[i].Token,
      ListInterest: JSON.stringify(data[i].ListInterest),
      Images: JSON.stringify(data[i].Images),
      IsActive: 1,
    })
  }
}
fs.readFile('./database.sql', (err, data) => {
  pool.query(data.toString(), (err) => {
    pool.end()
    insertData().then(() => {
      mysqlObject.pool.end()
    })
  })
})
