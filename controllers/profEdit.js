var dbController = require('./dbConnector.js');

var con = dbController();

con.connect(function(err) {if (err) console.log(err);});

module.exports = function(app){
    app.get('/prof-edit/:id', function(req, res) {
        con.query("SELECT personalization FROM user_details WHERE username = ?", [req.params.id], function (err, result, fields) {
            if (err){
                console.log(err);
            }else if (req.params.id===req.session.username){
                res.render('prof-edit',{person : result[0]});
            }else{
                res.redirect('/profile/'+req.params.id);
            }
        });        
    });
}
