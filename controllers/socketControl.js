const express = require('express')

module.exports = function(server) {
    var io = require('socket.io')(server)

    io.on('connection', function(client_socket){
        console.log("New User Connected!!");
        
    });
};
