var express = require('express');
var fs = require('fs');
var fa = require('./controllers/font-awesome.js');
var dbController = require('./controllers/db-connector.js');

// Fire Controllers
var app = express();
var con = dbController();

fa(app);

// Static files
app.use(express.static('./public'));

// Request Handle
app.get('/', function(req, res){
    res.writeHead(200, { 'Content-Type' : 'text/html'});
    var ReadStream = fs.createReadStream(__dirname + '/index.html', 'utf8');
    ReadStream.pipe(res);
});

// Listen to requests
app.listen(8080, '127.0.0.1');
console.log('Port 8080 Up!');
