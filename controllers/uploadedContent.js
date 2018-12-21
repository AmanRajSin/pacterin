var dbController = require('./dbConnector.js');

var con = dbController();
con.connect(function(err) {if (err) throw err;});

module.exports = function(app){
    app.get('/uploaded-content', function(req, res) {
        con.query("SELECT * FROM file_upload ORDER BY time ASC;", function (err, result, fields) {
            if (err) throw err;
            else {
                //res.writeHead(200, { 'Content-Type' : 'text/html'})
                if(result[0]) res.send(result);
                else res.send('');
            }
        });
    });
    app.get('/mediaContent/:postid', function(req, res) {
        con.query("SELECT * FROM file_upload WHERE time+username = ?", [req.params.postid], function(err, result, fields){
            if(err) throw err;
            con.query("SELECT * FROM comment_media WHERE postid = ?", [req.params.postid], function(error, results, field){
                con.query("SELECT * FROM reply_media WHERE postid = ?", [req.params.postid], function(qerr, re, fieldss){
                    Array.prototype.push.apply(result,results);
                    Array.prototype.push.apply(result,re);

                    res.send(result);
                });

            });

        });

    });
    /*app.get('/getmsg', function(req, res) {
        con.query("SELECT * FROM comment_media WHERE postid = ?", [req.params.postid], function(err, result, fields){
          if(err) throw err;
          if(result)
            res.send(result);
        console.log(req.body);
        });
    });*/
}
