const express = require('express')
var dbController = require('./dbConnector.js');

var con = dbController();

con.connect(function(err) {/*if (err) throw err;*/});

var userSocketId = {};
var usersOnline = [];

module.exports = function(server) {
    var io = require('socket.io')(server)
    var chat = io.of('/messenger');
    var mediaReact = io.of('/media');

    chat.on('connection', function(socket){
        socket.username = socket.request._query.username;
        userSocketId[socket.username] = socket.id;
        if(!usersOnline.includes(socket.username)) usersOnline.push(socket.username);
        //console.log(usersOnline);

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

        socket.on('recent_chats', function(){
            con.query('SELECT * from messenger WHERE (id LIKE "' + socket.username+'%" OR id LIKE "%' + socket.username + '");', function(err,result,fields){

                if (result[0]){
                    result.forEach( function(value, index){
                        result[index].messages = JSON.parse('{"messages":[' + result[index].messages.substring(1, result[0].messages.length) + ']}');
                    });
                    chat.to(socket.id).emit('recent_chats_res', { message: result});
                }
            });
        });

        socket.on('new_message', function(data){
            if(socket.username < data.to) {
                con.query(`UPDATE messenger SET messages=CONCAT(',{"from":"0","msg":"`+ data.message +`"}' , messages) WHERE id='`+ socket.username +`:`+ data.to +`';`, function(err,result,fields){
                    chat.to(userSocketId[data.to]).emit('new_message', {from: socket.username, message: data.message});
                });
            }
            else {
                con.query(`UPDATE messenger SET messages=CONCAT(',{"from":"1","msg":"`+ data.message +`"}' , messages) WHERE id='`+ data.to +`:`+ socket.username +`';`, function(err,result,fields){
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

    mediaReact.on('connection', function(socket){
        socket.username = socket.request._query.username;
        socket.on("upvote", function(data){
            con.query(`SELECT upvote,downvote,upvote_count,downvote_count FROM file_upload WHERE time= '`+data.time+`' AND username= '`+data.by+`';`, function(err,result,fields){
                result[0].downvote = JSON.parse(result[0].downvote);
                result[0].upvote = JSON.parse(result[0].upvote);
                if (result[0].downvote[data.username]){
                    delete result[0].downvote[data.username];
                    result[0].downvote_count--;
                }
                if (result[0].upvote[data.username]){
                    delete result[0].upvote[data.username];
                    result[0].upvote_count--;
                }else{
                    result[0].upvote[data.username] = 1;
                    result[0].upvote_count++;
                }
                var upvote_string = JSON.stringify(result[0].upvote);
                var downvote_string = JSON.stringify(result[0].downvote);
                con.query(`UPDATE file_upload SET upvote= '`+ upvote_string + `' WHERE time= '`+data.time+`' AND username= '`+data.by+`';`);
                con.query(`UPDATE file_upload SET downvote= '`+ downvote_string + `' WHERE time= '`+data.time+`' AND username= '`+data.by+`';`);
                con.query(`UPDATE file_upload SET upvote_count= `+ result[0].upvote_count + ` WHERE time= '`+data.time+`' AND username= '`+data.by+`';`);
                con.query(`UPDATE file_upload SET downvote_count= `+ result[0].downvote_count + ` WHERE time= '`+data.time+`' AND username= '`+data.by+`';`);
            });
        });
        socket.on("downvote", function(data){
            con.query(`SELECT upvote,downvote,upvote_count,downvote_count FROM file_upload WHERE time= '`+data.time+`' AND username= '`+data.by+`';`, function(err,result,fields){
                result[0].downvote = JSON.parse(result[0].downvote);
                result[0].upvote = JSON.parse(result[0].upvote);
                if (result[0].upvote[data.username]){
                    delete result[0].upvote[data.username];
                    result[0].upvote_count--;
                }
                if (result[0].downvote[data.username]){
                    delete result[0].downvote[data.username];
                    result[0].downvote_count--;
                }else{
                    result[0].downvote[data.username] = 1;
                    result[0].downvote_count++;
                }
                var downvote_string = JSON.stringify(result[0].downvote);
                var upvote_string = JSON.stringify(result[0].upvote);
                con.query(`UPDATE file_upload SET downvote= '`+ downvote_string + `' WHERE time= '`+data.time+`' AND username= '`+data.by+`';`);
                con.query(`UPDATE file_upload SET upvote= '`+ upvote_string + `' WHERE time= '`+data.time+`' AND username= '`+data.by+`';`);
                con.query(`UPDATE file_upload SET upvote_count= `+ result[0].upvote_count + ` WHERE time= '`+data.time+`' AND username= '`+data.by+`';`);
                con.query(`UPDATE file_upload SET downvote_count= `+ result[0].downvote_count + ` WHERE time= '`+data.time+`' AND username= '`+data.by+`';`);
            });
        });

        socket.on("upvoteComment", function(data){
            con.query(`SELECT upvoteComment,downvoteComment,upvoteComment_count,downvoteComment_count FROM comment_media WHERE commentid='`+data.commentid+`';`, function(err,result,fields){
                console.log(result);
                result[0].downvoteComment = JSON.parse(result[0].downvoteComment);
                result[0].upvoteComment = JSON.parse(result[0].upvoteComment);
                if (result[0].upvoteComment[data.username]){
                    delete result[0].upvoteComment[data.username];
                    result[0].upvoteComment_count--;
                }
                if (result[0].downvoteComment[data.username]){
                    delete result[0].downvoteComment[data.username];
                    result[0].downvoteComment_count--;
                }else{
                    result[0].upvoteComment[data.username] = 1;
                    result[0].upvoteComment_count++;
                }
                var downvote_string = JSON.stringify(result[0].downvoteComment);
                var upvote_string = JSON.stringify(result[0].upvoteComment);
                con.query(`UPDATE comment_media SET downvoteComment= '`+ downvote_string + `' WHERE commentid='`+data.commentid+`';`);
                con.query(`UPDATE comment_media SET upvoteComment= '`+ upvote_string + `' WHERE commentid='`+data.commentid+`';`);
                con.query(`UPDATE comment_media SET upvoteComment_count= `+ result[0].upvoteComment_count + ` WHERE commentid='`+data.commentid+`';`);
                con.query(`UPDATE comment_media SET downvoteComment_count= `+ result[0].downvoteComment_count + ` WHERE commentid='`+data.commentid+`';`);

            });
        });

        socket.on("downvoteComment", function(data){
            con.query(`SELECT upvoteComment,downvoteComment,upvoteComment_count,downvoteComment_count FROM comment_media WHERE commentid='`+data.commentid+`';`, function(err,result,fields){
                result[0].downvoteComment = JSON.parse(result[0].downvoteComment);
                result[0].upvoteComment = JSON.parse(result[0].upvoteComment);
                if (result[0].upvoteComment[data.username]){
                    delete result[0].upvoteComment[data.username];
                    result[0].upvoteComment_count--;
                }
                if (result[0].downvoteComment[data.username]){
                    delete result[0].downvoteComment[data.username];
                    result[0].downvoteComment_count--;
                }else{
                    result[0].downvoteComment[data.username] = 1;
                    result[0].downvoteComment_count++;
                }
                var downvote_string = JSON.stringify(result[0].downvoteComment);
                var upvote_string = JSON.stringify(result[0].upvoteComment);
                con.query(`UPDATE comment_media SET downvoteComment= '`+ downvote_string + `' WHERE commentid='`+data.commentid+`';`);
                con.query(`UPDATE comment_media SET upvoteComment= '`+ upvote_string + `' WHERE commentid='`+data.commentid+`';`);
                con.query(`UPDATE comment_media SET upvoteComment_count= `+ result[0].upvoteComment_count + ` WHERE commentid='`+data.commentid+`';`);
                con.query(`UPDATE comment_media SET downvoteComment_count= `+ result[0].downvoteComment_count + ` WHERE commentid='`+data.commentid+`';`);

            });
        });

        socket.on("downvoteReply", function(data){
            con.query(`SELECT upvoteReply,downvoteReply,upvoteReply_count,downvoteReply_count FROM reply_media WHERE replyid='`+data.replyid+`';`, function(err,result,fields){
                result[0].downvoteReply = JSON.parse(result[0].downvoteReply);
                result[0].upvoteReply = JSON.parse(result[0].upvoteReply);
                if (result[0].upvoteReply[data.username]){
                    delete result[0].upvoteReply[data.username];
                    result[0].upvoteReply_count--;
                }
                if (result[0].downvoteReply[data.username]){
                    delete result[0].downvoteReply[data.username];
                    result[0].downvoteReply_count--;
                }else{
                    result[0].downvoteReply[data.username] = 1;
                    result[0].downvoteReply_count++;
                }
                var downvote_string = JSON.stringify(result[0].downvoteReply);
                var upvote_string = JSON.stringify(result[0].upvoteReply);
                con.query(`UPDATE reply_media SET downvoteReply= '`+ downvote_string + `' WHERE replyid='`+data.replyid+`';`);
                con.query(`UPDATE reply_media SET upvoteReply= '`+ upvote_string + `' WHERE replyid='`+data.replyid+`';`);
                con.query(`UPDATE reply_media SET upvoteReply_count= `+ result[0].upvoteReply_count + ` WHERE replyid='`+data.replyid+`';`);
                con.query(`UPDATE reply_media SET downvoteReply_count= `+ result[0].downvoteReply_count + ` WHERE replyid='`+data.replyid+`';`);

            });
        });

        socket.on("upvoteReply", function(data){
            con.query(`SELECT upvoteReply,downvoteReply,upvoteReply_count,downvoteReply_count FROM reply_media WHERE replyid='`+data.replyid+`';`, function(err,result,fields){
                console.log(result);
                result[0].downvoteReply = JSON.parse(result[0].downvoteReply);
                result[0].upvoteReply = JSON.parse(result[0].upvoteReply);
                if (result[0].upvoteReply[data.username]){
                    delete result[0].upvoteReply[data.username];
                    result[0].upvoteReply_count--;
                }
                if (result[0].downvoteReply[data.username]){
                    delete result[0].downvoteReply[data.username];
                    result[0].downvoteReply_count--;
                }else{
                    result[0].upvoteReply[data.username] = 1;
                    result[0].upvoteReply_count++;
                }
                var downvote_string = JSON.stringify(result[0].downvoteReply);
                var upvote_string = JSON.stringify(result[0].upvoteReply);
                con.query(`UPDATE reply_media SET downvoteReply= '`+ downvote_string + `' WHERE replyid='`+data.replyid+`';`);
                con.query(`UPDATE reply_media SET upvoteReply= '`+ upvote_string + `' WHERE replyid='`+data.replyid+`';`);
                con.query(`UPDATE reply_media SET upvoteReply_count= `+ result[0].upvoteReply_count + ` WHERE replyid='`+data.replyid+`';`);
                con.query(`UPDATE reply_media SET downvoteReply_count= `+ result[0].downvoteReply_count + ` WHERE replyid='`+data.replyid+`';`);

            });
        });
    });

}
