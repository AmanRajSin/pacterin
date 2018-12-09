var session = require('express-session')
var MYSQLSessionStore = require('express-mysql-session')(session)
var dbConnector = require('./dbConnector')

var conn = dbConnector();
var sessionStore = new MYSQLSessionStore({
    clearExpired : true,
    checkExpirationInterval: 900000,
    expiration: 1000*60*60*24,
    createDatabaseTable: true,
    connectionLimit: 1,
    endConnectionOnClose: true,
    charset: 'utf8mb4_bin',
    schema: {
        tableName: 'sessions',
        columnNames: {
            session_id: 'session_id',
            expires: 'expires',
            data: 'data'
        }
    }
}, conn);

module.exports = {
    secret : 'some shitty string',
    store : sessionStore,
    resave : false,
    saveUninitialized : false,
    rolling : true,
    cookie : { maxAge : 1000*60*60*24 }
}
