var formidable = require('formidable');
var fs = require('fs');
var path = require('path');
var multer = require('multer');
var upload = multer({ dest: 'uploads/' });
var bodyParser = require('body-parser');
var dbController = require('./dbConnector.js');

var con = dbController();
var urlencodedParser = bodyParser.urlencoded({ extended: false });

con.connect(function(err) {if (err) console.log(err);});

module.exports = function(app){

    app.post('/commentpost', upload.single('ToUpload'), function(req, res, next) {
        var ext = '';
        if(typeof req.file != "undefined"){
            var oldpath = req.file.path;
            ext = path.extname(req.file.originalname);
            var newpath = './public/comment-images/' + req.body.commentid + ext;
            fs.rename(oldpath, newpath, function (err) {
                if (err) console.log(err);
            });
        }
        con.query(`INSERT INTO comment_media VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) `, [req.body.postid, req.body.commentid, req.body.commentVal, ext, "{}", 0, "{}", 0, ""], function(q_err, result, fields){

        });
        res.redirect('/mediaPost/' + req.body.postid);

    });
    app.post('/replypost', upload.single('ToBeUploaded'), function(req, res, next) {
        var ext = '';
        var d = new Date();
        d = d.getTime();
        if(typeof req.file != "undefined"){
            var oldpath = req.file.path;
            ext = path.extname(req.file.originalname);
            var newpath = './public/reply-images/' + d + req.session.username + ext;
            fs.rename(oldpath, newpath, function (err) {
                if (err) console.log(err);
            });
        }
        /*con.query(`SELECT replies FROM comment_media WHERE postid = ? and commentid = ?; `, [req.body.postid, req.body.commentid], function(q_err, result, fields){
            console.log(result);

            con.query(`UPDATE comment_media SET replies = ? WHERE postid = ? and commentid = ?; `, [result[0].replies + '\\' + req.body.commentid + '/' + req.body.commentVal, req.body.postid, req.body.commentid], function(err, results, field){

            });
        });*/
        con.query(`INSERT INTO reply_media VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) `, [req.body.postid, req.body.commentid, d + req.session.username, req.body.commentVal, ext, "{}", 0, "{}", 0], function(q_err, result, fields){
        });
        res.redirect('/mediaPost/' + req.body.postid);

    });

    app.post('/fileupload', upload.single('filetoupload'), function(req, res, next) {
        //console.log(req.body);
        //console.log(req.file);
        var oldpath = req.file.path;
        var ext = path.extname(req.file.originalname);
        var d = new Date();
        if (ext == '.jpg' || ext == '.png' || ext == '.jpeg'){
            var newpath = './public/upload-images/' + d.getTime() + req.session.username + ext;
            var type='image';
        }else if (ext == '.gif'){
            var newpath = './public/upload-images/' + d.getTime() + req.session.username + ext;
            var type='gif';
        }else if(ext == '.mp4' || ext == '.mkv' || ext == '.mov'){
            var newpath = './public/upload-videos/' + d.getTime() + req.session.username + ext;
            var type = 'video';
        }
        else{
          var newpath = "";
        }
        if (req.body.oc){
            req.body.section = '1'+req.body.section;
        }else{
            req.body.section = '0'+req.body.section;
        }
        if(newpath){
          fs.rename(oldpath, newpath, function (err) {
              if (err) console.log(err);

              con.query(`INSERT INTO file_upload VALUES (? , ?, ?, ? , ?, ?, ?, ?, ?, ?, ?, ?) `, [req.session.username, type, ext, req.body.postTitle, d.getTime(), req.body.section, "{}", 0, "{}", 0, req.body.postStory, req.body.tagPills], function(q_err, result, fields){
                  res.redirect('/upload');
              });
          });
        }
        else{
          res.redirect('/upload');
        }
    });
    app.get('/public/images/:id', function(req,res){
        res.sendFile(path.join(__dirname, '../public/upload-images/',req.params.id));
    });
    app.get('/public/videos/:id', function(req,res){
        res.sendFile(path.join(__dirname, '../public/upload-videos/',req.params.id));
    });
}
