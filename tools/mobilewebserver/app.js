var port = process.argv[2] || 8060;
var dir  = '../../build/mobileweb';

var connect = require('connect');
var app     = connect();

var serveStatic = require('serve-static');

connect.createServer(
    app.use(serveStatic(dir, {'index': ['index.html', 'index.htm']}))
).listen(parseInt(port, 10));
