var connect = require('connect');
var serveStatic = require('serve-static');
connect().use(serveStatic(__dirname)).listen(4180, function(){
	    console.log('Server running on 4180...');
});

