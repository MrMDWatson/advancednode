'use strict';
require('dotenv').config();
const express = require('express');
const myDB = require('./connection');
const session = require("express-session");
const passport = require("passport");

const routes = require('./routes.js');
const auth = require("./auth.js");
const fccTesting = require('./freeCodeCamp/fcctesting.js');

const app = express();

const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.set('view engine', 'pug');
app.set("views", "./views/pug");

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.use(passport.initialize());
app.use(passport.session());

fccTesting(app); //For FCC testing purposes
app.use('/public', express.static(process.cwd() + '/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


myDB(async client => {
  
  const myDataBase = await client.db("boiler").collection("users");
  routes(app, myDataBase);
  auth(app, myDataBase);

  // Be sure to add this...
}).catch(e => {
  app.route('/').get((req, res) => {
    res.render('index', { title: e, message: 'Unable to connect to database' });
  });
});
// app.listen out here...

io.on("connection", socket => {
  console.log("A user has connected")
})


const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log('Listening on port ' + PORT);
});
