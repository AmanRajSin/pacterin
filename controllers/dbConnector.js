var mysql = require('mysql');

module.exports = function(){
    return mysql.createConnection({
        host: 'eu-cdbr-west-02.cleardb.net',
        user: 'b440c8bef3ca06',
        password: '1c7a0023',
        database: 'heroku_5a47c3968322ffa'
    });
};
