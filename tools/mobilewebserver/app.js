var port = process.argv[2] || 8060;
var dir  = '../../build/mobileweb';

var connect = require('connect');
var app     = connect();

var serveStatic = require('serve-static');

app.use(serveStatic(dir, {'index': ['index.html', 'index.htm']}));
app.listen(parseInt(port, 10));
