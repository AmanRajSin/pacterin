//const express = require('express')
const dbController = require('./dbConnector.js');
const bodyParser = require('body-parser');

var con = dbController();
var urlencodedParser = bodyParser.urlencoded({ extended: false });

con.connect(function(err) {/*if (err) throw err;*/});

module.exports = function(app) {
    app.post('/streamauth', urlencodedParser, function(req, res) {
        var stream_key = req.body.name;
        con.query(`SELECT * FROM stream_keys WHERE stream_key = "`+stream_key+`";`, function(err,result,fields){
            if (!result[0]){
                res.status(404).end();
            } else {
                res.writeHead(300, {'location':result[0].username});
                res.end();
            }
        });
    });
}