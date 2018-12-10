const express = require('express')

var userSocketId = {};

module.exports = function(server) {
    var io = require('socket.io')(server)
    var chat = io.of('/messenger');

    chat.on('connection', function(socket){
        socket.username = socket.request._query.username;
        userSocketId[socket.username] = socket.id;
        console.log(userSocketId);

        socket.on('new_message', function(data){
            chat.to(userSocketId[data.to]).emit('new_message', {from: socket.username, message: data.message});
        });

        socket.on('disconnect', function(){
            delete userSocketId[socket.username];
            console.log(userSocketId);
        });

        socket.on('user_typing', function(data){
            chat.to(userSocketId[data.to]).emit('get_user_typing', {from: socket.username})
        });
        socket.on('user_not_typing', function(data){
            chat.to(userSocketId[data.to]).emit('get_user_not_typing', {from: socket.username})
        });
    });
}