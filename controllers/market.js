var dbController = require('./dbConnector.js');

var con = dbController();
con.connect(function(err) {if (err) throw err;});

module.exports = function(app){
    app.get('/market', function(req,res){
        res.render('./market');
    });
    app.get('/marketplace', function(req,res){
        if (req.query.order === 'asc'){
            con.query("SELECT * FROM market_items ORDER BY normal_price", function(err, result, fields){
                res.send(result);
            });
        }else if (req.query.order === 'desc'){
            con.query("SELECT * FROM market_items ORDER BY normal_price desc", function(err, result, fields){
                res.send(result);
            });
        }else{
            con.query("SELECT * FROM market_items", function(err, result, fields){
                res.send(result);
            });
        }
    });
    app.get('/productpage/:id', function(req,res){
        res.render('./product_page',{id:req.params.id});
    });
    app.get('/product/:id', function(req,res){
        con.query("SELECT * FROM market_items", function(err, result, fields){
            result.forEach((val) => {
                var str = val.id;
                str = str.replace(/[ |()]/g,'');
                if (str == req.params.id){
                    res.send(val);
                }
            });   
        });
    });
}