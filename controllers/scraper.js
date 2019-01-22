const rp = require('request-promise');
const cheerio = require('cheerio');
const dbController = require('./dbConnector.js');

var con = dbController();
con.connect(function(err) {if (err) throw err;});

var id;

module.exports = function(app){
    app.get('/scrape', function(req,res){
        con.query(`SELECT id FROM market_items`, function(err,result,fields){
            $.each(result, function(index, value){
                var str = value.id;
                var length = str.length;
                for(var i=0; i<length;i++)
                    str = str.replace(' ', '+');
                //console.log(str);
                var options = {
                    uri: 'https://steamcommunity.com/market/search?q=' + str,
                    transform: function (body) {
                        //console.log(cheerio.load(body));
                        return cheerio.load(body);
                    }
                };
                //console.log(options);
                rp(options).then(function($){
                    con.query(`SELECT * from market_items WHERE id ="`+$('#result_0_name').text()+`";`, function(err1,results1,fields1){
				        var nor_price = $('#result_0 .normal_price .normal_price').text();
                        nor_price = nor_price.substring(1,nor_price.length-4);
                        var price = $('#result_0 .sale_price').text();
				        price = price.substring(1,price.length-4);
                        if (results1[0]){
                            con.query(`UPDATE market_items SET normal_price = `+nor_price+`, sale_price =`+price+`, quantity ="`+$('#result_0 .market_listing_num_listings_qty').text()+`" WHERE id ="`+$('#result_0_name').text()+ `";`,function(err,results,fields){
                                //console.log("updated");
                                //res.end(''+$('#result_0'));
                            });
                        }else{
                            con.query("INSERT INTO market_items VALUES (?,?,?,?,?,?);",[$('#result_0_name').text(),$('#result_0 .market_listing_game_name').text(),$('#result_0 .normal_price .normal_price').text(),$('#result_0 .sale_price').text(),$('#result_0 .market_listing_num_listings_qty').text(),$('#result_0_image').attr('src')],function(err,results,fields){
                                //console.log("added");
                                //res.end(''+$('#result_0'));
                            });
                        }
                        id = $('#result_0_name').text();
                        funct();
                    });
                }).catch(function(err){
                    console.log(err);
                }); 
            });
        });
    });
}