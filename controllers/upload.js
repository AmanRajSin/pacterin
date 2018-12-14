var formidable = require('formidable');
var fs = require('fs');
var path = require('path');
var multer = require('multer');
var upload = multer({ dest: 'uploads/' })

var bodyParser = require('body-parser');
var dbController = require('./dbConnector.js');

var con = dbController();
var urlencodedParser = bodyParser.urlencoded({ extended: false });

con.connect(function(err) {if (err) console.log(err);});

module.exports = function(app){
    app.post('/fileupload', upload.single('filetoupload'), function(req, res, next) {   
        console.log(req.body); 
        console.log(req.file);   
        var oldpath = req.file.path;
        var ext = path.extname(req.file.originalname);
        var d = new Date();
        if (ext == '.jpg' || ext == '.png' || ext == '.jpeg'){
            var newpath = './public/upload-images/' + d.getTime() + req.session.username + ext;
            var type='image';
        }else if (ext == '.gif'){
            var newpath = './public/upload-images/' + d.getTime() + req.session.username + ext;
            var type='gif';
        }else{
            var newpath = './public/upload-videos/' + d.getTime() + req.session.username + ext;
            var type = 'video';
        }
        if (req.body.oc){
            req.body.section = '1'+req.body.section;
        }else{
            req.body.section = '0'+req.body.section;
        }
        fs.rename(oldpath, newpath, function (err) {
            if (err) console.log(err);
            con.query(`INSERT INTO file_upload VALUES (? , ?, ? , ? , ?, ?, ?, ?, ?, ?, ?) `, [req.session.username, type, ext, req.body.postTitle, d.getTime(), req.body.section, "{}", 0, "{}", 0, req.body.postStory], function(q_err, result, fields){
                res.redirect('/upload');
            });
        });
    });
    app.get('/public/images/:id', function(req,res){
        res.sendFile(path.join(__dirname, '../public/upload-images/',req.params.id));
    });
    app.get('/public/videos/:id', function(req,res){
        res.sendFile(path.join(__dirname, '../public/upload-videos/',req.params.id));
    });
}