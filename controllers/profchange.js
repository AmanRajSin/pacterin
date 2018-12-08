var bodyParser = require('body-parser');
var dbController = require('./dbConnector.js');

var con = dbController();
var urlencodedParser = bodyParser.urlencoded({ extended: false });

con.connect(function(err) {/*if (err) throw err;*/});

module.exports = function(app){
    app.post('/prof-edit-submit', urlencodedParser, function(req, res) {
        con.query("UPDATE user_details SET personalization = ? WHERE username = ? ", [req.body.avatar,req.session.username], function (q_err, result, fields) {
            if (q_err) console.log(q_err);
            else {
                res.redirect('/profile/'+req.session.username);
            }
        });
    });
};