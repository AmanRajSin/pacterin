var dbController = require('./dbConnector.js');

var con = dbController();

con.connect(function(err) {if (err) console.log(err);});

module.exports = function(app){
    app.get('/logout/:id', function(req, res) {
        con.query("SELECT * FROM sessions WHERE data.username = ?", [req.params.id], function (err, result, fields) {
            if (req.params.id===req.session.username){
                req.session.destroy(function(err){
                    res.redirect('/login');
                });
            }else{
                res.redirect('/profile/'+req.params.id);
            }
        });
    });        
}
