var bodyParser = require('body-parser');
var dbController = require('./dbConnector.js');

var con = dbController();
var urlencodedParser = bodyParser.urlencoded({ extended: false });

con.connect(function(err) {if (err) console.log(err);});

module.exports = function(app){
    app.post('/login-submit', urlencodedParser, function(req, res) {        
        con.query("SELECT * FROM user_auth WHERE username = ? AND password = ?", [req.body.username, req.body.password], function (q_err, result, fields) {
            if(result) {
                req.session.save(function(err) {
                    if(err) console.log(err);
                    else {
                        req.session.username = req.body.username;
                        res.redirect('/');
                    }
                });
            }
        });
    });
}
