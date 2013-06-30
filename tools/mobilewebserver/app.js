var port = process.argv[2] || 8060;
var dir  = '../../build/mobileweb';

var connect = require('connect');
connect.createServer(
    connect.static(dir)
).listen(parseInt(port, 10));
