var bodyParser = require('body-parser');
var dbController = require('./dbConnector.js');

var con = dbController();
var urlencodedParser = bodyParser.urlencoded({ extended: false });
con.connect(function(err) {if (err) throw err;});

module.exports = function(app){
    app.post('/username-availability-check', urlencodedParser, function(req, res) {
        con.query("SELECT username FROM user_auth WHERE username = ?", [req.body.username], function (err, result, fields) {
            if (err) throw err;
            else {
                res.writeHead(200, { 'Content-Type' : 'text/html'})
                if(result[0]) res.end('<span style="color: red;"> Username Not Available.</span>');
                else res.end('<span style="color:green;"> Username Available.</span>');
            } 
        });    
    });
}
