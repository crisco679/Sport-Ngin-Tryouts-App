require('dotenv').config();
var express = require('express');
var app = express();
var session = require('express-session');
var mongoose = require('mongoose');
var morgan = require('morgan');
var path = require('path');
var passport = require('passport');
var OAuth2Strategy = require('passport-oauth2').Strategy;
var request = require('request');
var bodyParser = require('body-parser');
var router = require('./routes/router');
var User = require('../models/user');

////////////////////////////////////////////////////////////////////
//MongoDB
////////////////////////////////////////////////////////////////////
var mongoUri = 'mongodb://localhost/sportNginDB';
var mongoDB = mongoose.connect(mongoUri).connection;
mongoDB.on('error', function(err){
  console.log('MongoDB connection error', err);
});
mongoDB.once('open', function(){
  console.log('MongoDB connection open.');
});

////////////////////////////////////////////////////////////////////
//Config
////////////////////////////////////////////////////////////////////
app.use(morgan('dev'));
app.use(express.static('server/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
////////////////////////////////////////////////////////////////////
//Passport
////////////////////////////////////////////////////////////////////
app.use(session({
  secret: 'sportNgin',
  resave: true,
  saveUninitialized: false,
  cookie: {maxAge: 6000000, secure: false}
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new OAuth2Strategy({
    authorizationURL: 'https://user.sportngin.com/oauth/authorize',
    tokenURL: 'https://api-user.ngin.com/oauth/token',
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: 'http://localhost:3000/auth/sportngin/callback'
  },
  function(accessToken, refreshToken, profile, fourth, cb) {
    // console.log('profile', profile);
    console.log('accessToken', accessToken, 'refreshToken', refreshToken, 'profile', profile, 'fourth', fourth, 'cb', cb);
    // console.log('profile.access_token', profile.access_token);
    var url = "http://api-user.ngin.com/oauth/me?access_token=" + profile.access_token;
    // console.log(url);

    var options = {json: true};

    options.url = url;

    console.log(url);

    request.get(options, function(err, response, body){
      // console.log('body', body);
      // console.log('code', response.statusCode);
      // console.log('headers', response.headers)
         if(!err && response.statusCode == 200){
           console.log('body', body)
           var newUser = {};
           User.findOne({ 'nginId': body.metadata.current_user.id }, function (err, user) {
             console.log('HELLO!!!!!')
             console.log('USER!!!!!!!',user);
             if(err){
               console.log(err);
             } else if(user=="" || user == null){
               //  Code here, add user to database
               newUser = new User({
                 username: body.metadata.current_user.user_name,
                 first_name: body.metadata.current_user.first_name,
                 last_name: body.metadata.current_user.last_name,
                 nginId: body.metadata.current_user.id
               });
               newUser.save(function(err){
                 if(err){
                   console.log('Issue saving to database with error', err);
                   return cb(err, user);
                 } else {
                   console.log('user saved successfully');
                   return cb(err, user);
                 }
               })
             } else {
               return cb(err, user);
             }
           });
         }
    //   // console.log('code', response.data);
    })


  } //  function(accessToken)
)); //  passport.use

///////////////////////////////////////// ///////////////////////////
//Routers
////////////////////////////////////////////////////////////////////
app.use('/', router);

////////////////////////////////////////////////////////////////////
//Server
////////////////////////////////////////////////////////////////////
var server = app.listen(process.env.PORT || 3000, function(){
  var port = server.address().port;
  console.log('Listening on port', port);
})
