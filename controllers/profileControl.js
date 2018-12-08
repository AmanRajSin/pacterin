var dbController = require('./dbConnector.js');

var con = dbController();

con.connect(function(err) {if (err) console.log(err);});

module.exports = function(app){
    app.get('/profile/:id', function(req, res) {
        con.query("SELECT * FROM user_details WHERE username = ?", [req.params.id], function (err, result, fields) {
            if (err){
                console.log(err);
            }else{
                con.query("SELECT * FROM user_cred WHERE username = ?", [req.params.id], function (err2, result2, fields2) {
                    if (err2){
                        console.log(err2);
                    }else{
                        result[0].self = (req.params.id===req.session.username);
                        result[0].email = result2[0].email;
                        result[0].phone = result2[0].phone;
                        result[0].linked_accounts = result2[0].linked_accounts;
                        res.render('profile',{person : result[0]});
                    }
                });
            }
        });
    });      
};