const express = require('express')
var dbController = require('./dbConnector.js');

var con = dbController();

con.connect(function(err) {/*if (err) throw err;*/});

var userSocketId = {};
var usersOnline = [];

module.exports = function(server) {
    var io = require('socket.io')(server)
    var chat = io.of('/messenger');

    chat.on('connection', function(socket){
        socket.username = socket.request._query.username;
        userSocketId[socket.username] = socket.id;
        if(!usersOnline.includes(socket.username)) usersOnline.push(socket.username);
        console.log(usersOnline);

        chat.emit('friends_update', {users: usersOnline});

        socket.on('req_chat_history', function(data){
            if(socket.username<data.to) {
                con.query("SELECT (messages) FROM messenger WHERE (id='" + socket.username + ":"+ data.to + "')", function(err, result, fields){
                    if(result[0]){
                        var historyJSON = JSON.parse('{"messages":[' + result[0].messages.substring(1, result[0].messages.length) + ']}');
                        chat.to(socket.id).emit('chat_history', historyJSON);
                    }
                });
            }
            else {
                con.query("SELECT (messages) FROM messenger WHERE (id='" + data.to + ":"+ socket.username + "')", function(err, result, fields){
                    if(result[0]){
                        var historyJSON = JSON.parse('{"messages":[' + result[0].messages.substring(1, result[0].messages.length) + ']}');
                        chat.to(socket.id).emit('chat_history', historyJSON);
                    }
                });
            }
        });

        socket.on('new_message', function(data){
            if(socket.username < data.to) {
                con.query(`UPDATE messenger SET messages=CONCAT(messages, ',{"from":"0","msg":"`+ data.message +`"}') WHERE id='`+ socket.username +`:`+ data.to +`';`, function(err,result,fields){
                    chat.to(userSocketId[data.to]).emit('new_message', {from: socket.username, message: data.message});
                });
            }
            else {
                con.query(`UPDATE messenger SET messages=CONCAT(messages, ',{"from":"1","msg":"`+ data.message +`"}') WHERE id='`+ data.to +`:`+ socket.username +`';`, function(err,result,fields){
                    chat.to(userSocketId[data.to]).emit('new_message', {from: socket.username, message: data.message});
                });
            }
        });

        socket.on('disconnect', function(){
            delete userSocketId[socket.username];
            usersOnline = usersOnline.filter(function(value){ return value!=socket.username; });
            chat.emit('friends_update', {users: usersOnline});
        });

        socket.on('user_typing', function(data){
            chat.to(userSocketId[data.to]).emit('get_user_typing', {from: socket.username})
        });
        socket.on('user_not_typing', function(data){
            chat.to(userSocketId[data.to]).emit('get_user_not_typing', {from: socket.username})
        });
    });
}