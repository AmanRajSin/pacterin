var bodyParser = require('body-parser');
var dbController = require('./dbConnector.js');

var con = dbController();
var urlencodedParser = bodyParser.urlencoded({ extended: false });

con.connect(function(err) {/*if (err) throw err;*/});

module.exports = function(app){
    app.post('/signup-submit', urlencodedParser, function(req, res) {        
        con.query("INSERT INTO user_auth VALUES (?, ?)", [req.body.username, req.body.password], function (err, result, fields) {
            //if (err) throw err;
            console.log(result);
        });
    });
};