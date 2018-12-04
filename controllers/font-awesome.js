module.exports  = function(app){
    app.post('/configs/font-awesome', function(req, res){
        res.writeHead(200, { 'Content-Type' : 'text/html'});
        res.end('<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.5.0/css/all.css" integrity="sha384-B4dIYHKNBt8Bc12p+WXckhzcICo0wtJAoU8YZTY5qE0Id1GSseTk6S+L3BlXeVIU" crossorigin="anonymous">')
    });
};