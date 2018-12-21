const express = require('express')
const session = require('express-session')
const sessionControl = require('./sessionControl')
const socketControl = require('./socketControl')

module.exports = function(app){
    app.set('view engine', 'ejs');
    app.use(session(sessionControl));

    // Static files
    app.use(express.static('./public'));

    // Request Handle
    app.get('/', function(req, res) { res.render('./index');});
    app.get('/login', function(req, res) { res.render('./login');});
    app.get('/signup', function(req, res) { res.render('./signup');});
    app.get('/messenger', function(req, res) { res.render('./messenger',{username:req.session.username});});
    app.get('/messenger/:id', function(req,res) { res.render('./messenger_personal', {to:req.params.id, from:req.session.username});});
    app.get('/upload', function(req, res) { res.render('./upload',{username:req.session.username});});
    app.get('/mediaPost/:postid', function(req, res) {res.render('./mediaPost',{username: req.session.username, postid: req.params.postid});});
    
    // Listen to Port
    socketControl(app.listen(process.env.PORT||2000));
    console.log('Port 2000 Up!');
}
