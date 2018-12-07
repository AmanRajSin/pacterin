var express = require('express')
var fs = require('fs')
var loginControl = require('./controllers/loginControl')
var signupControl = require('./controllers/signupControl')
var usernameAvailability = require('./controllers/usernameAvailabilityCheck')
var sessionControl = require('./controllers/sessionControl')

var app = express();
app.set('view engine', 'ejs');
app.use(session(sessionControl));

// Fire Controllers
loginControl(app);
signupControl(app);
usernameAvailability(app);

// Static files
app.use(express.static('./public'));

// Request Handle
app.get('/', function(req, res) { res.render('./index');});
app.get('/login', function(req, res) { res.render('./login');});
app.get('/signup', function(req, res) { res.render('./signup');});

// Listen to Port
app.listen(process.env.PORT||80);
console.log('Port 80 Up!');
