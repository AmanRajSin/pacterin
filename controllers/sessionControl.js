var session = require('express-session')
var MYSQLSessionStore = require('express-mysql-session')(session)
var dbConnector = require('./dbConnector')

var conn = dbConnector();
var sessionStore = new MYSQLSessionStore({
    clearExpired : true,
    checkExpirationInterval: 900000,
    expiration: 86400000,
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

var sessionInfo = {
    secret : 'some shitty string',
    store : sessionStore,
    resave : false,
    saveUninitialized: false,
    cookie : {}
}

module.exports = function(app) {
    app.use(session(sessionInfo));
}
