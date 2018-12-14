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
}
