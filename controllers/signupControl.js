var bodyParser = require('body-parser');
var dbController = require('./dbConnector.js');

var con = dbController();
var urlencodedParser = bodyParser.urlencoded({ extended: false });

con.connect(function(err) {/*if (err) throw err;*/});

module.exports = function(app){
    app.post('/signup-submit', urlencodedParser, function(req, res) {        
        con.query("INSERT INTO user_auth VALUES (?, ?)", [req.body.username, req.body.password], function (q_err, result, fields) {
            if (q_err) console.log(q_err);
            con.query("INSERT INTO user_details VALUES (?, ?)", [req.body.username, req.body.email], function(q_err2, result2, fields2){
                if(q_err2) console.log(q_err2);
                else {
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
    });
};