var mysql = require('mysql');

module.exports = function(){
    return mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '1234',
        database: 'smoke'
    }).connect(function(err) {
        if (err) throw err;
        console.log("Connected!");
    });
};