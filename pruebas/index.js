var express = require('express');
var app = express();
var unuko = {};
unuko.app = app;
unuko.modules = {};
unuko.modules.menu = require('./menu')(unuko);
unuko.modules.config = require('./config')(unuko);
unuko.modules.roles = require('./roles')(unuko)


unuko.modules.menu.create('main');
unuko.modules.menu.create('admin');


for(var m in unuko.modules) {
	unuko.modules[m].initialize();
}
for(var m in unuko.modules) {
	if(unuko.modules[m].initializeMiddleware) {
		unuko.modules[m].initializeMiddleware();
	}
}

//crear menus
var _paths = unuko.modules.menu.items('admin');
_paths.forEach(function(element) {
	if(element.access_callback) {
		console.log('Access callback')
		unuko.app.get(element.path, element.access_callback);
	}
	console.log('-->Routing ', element);
	if(element.callback) {
		unuko.app.get(element.path, element.callback);
	} else {
		unuko.app.get(element.path, function(req, res) {
			res.send(element)
		});
	}
});




//console.log("getDeep: %j", menu.getDeep('admin'));


app.listen(3000);