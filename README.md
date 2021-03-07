# Matcha <img src="https://img.shields.io/static/v1?label=&message=socket.io&logo=socket.io&color=gray"/> <img src="https://img.shields.io/static/v1?label=&message=nodejs&logo=node.js&color=gray"/> <img src="https://img.shields.io/static/v1?label=&message=react&logo=react&color=gray"/>

Creating a dating site using React, Node JS and MySQL

## Intro

Objective of this project is to create a complete dating website that allows users to search, discover profiles according to their preferences and geolocation, show them some love with real-time likes, notifications and chat if both profiles match.

### Stack

* Node JS (Express)
* React JS
* Material UI Front libraries
* Redux JS
* MySQL
* JSON web tokens
* Axios for API requests
* Websockets (socket.io) for real-time
### Features

My Matcha project handles:
* DB creation script
* User creation and authentication using token
* Pictures upload and default profile picture
* Complete user profile page with gender, bio, location, interests details...
* User profile edition (password, details, preferences)
* Profiles discovery based on matching algorithm and user preferences
* Popularity score calculated for each user based on interactions with other profiles
* Real-time notifications for likes, profile views and matches
* Real-time chat if two profiles match
* User ability to block or report another profile
* Email notifications for authentication and password reset (with auth key)
* Change and reset of email/forgot password with ID validation
* Profile, pictures deletion and user DB cleanup
* Responsive design from mobile to desktop/tablet
* User input and upload checks (front/backend)
* Password hashing
* HTML/Javascript/SQL injections prevention
## Installation

install package for client and server

```bash
npm --prefix ./server install
npm --prefix ./client install
node ./server/Config/Setup.js #generate 580 users
```

How to run client-side

```bash
cd client
#production mode
npm run startDev #OR
#development mode
npm run startProduc
```

How to run server-side

```bash
cd server
npm run start
```

## Environment Variables

create .env file inside server folder and add the following variables

```env
PORT= <port>
HOST= <host>
PROTOCOL= <protocol>
CLIENT_PORT= <port>
CLIENT_HOST= <host>
CLIENT_PROTOCOL= <protocol>
MYSQL_HOST= <host>
MYSQL_PORT= <port>
MYSQL_USER= <user>
MYSQL_PASSWORD= <password>
MYSQL_DATABASE= <database>
opencagedata_API_KEY= <key>
NODEMAILER_EMAIL= <email>
NODEMAILER_PASS= <password>
JWT_KEY= <key>
```

## Screenshots

Home Dark/Light mode</br>
![](Screenshots/home_light.png)</br>
![](Screenshots/home_dark.png)</br>
SignIn Dark/Light mode</br>
![](Screenshots/signin_light.png)</br>
![](Screenshots/signin_dark.png)</br>
SignUp Dark/Light mode</br>
![](Screenshots/signup_light.png)</br>
![](Screenshots/signup_dark.png)</br>
Dashboard Dark/Light mode</br>
![](Screenshots/dashboard_light.png)</br>
![](Screenshots/dashboard_dark.png)</br>
Profile Dark/Light mode</br>
![](Screenshots/profile_light.png)</br>
![](Screenshots/profile_dark.png)</br>
History Dark/Light mode</br>
![](Screenshots/history_light.png)</br>
![](Screenshots/history_dark.png)</br>
Steps</br>
![](Screenshots/step1.png)</br>
![](Screenshots/step2.png)</br>
![](Screenshots/step3.png)</br>
