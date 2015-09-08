var express = require('express');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var cookieParser = require('cookie-parser');

unuko = {};
unuko.app = express();
unuko.mongoose = require('mongoose');
unuko.models = {};
unuko.Schema = unuko.mongoose.Schema;


unuko.mongoose.connect('mongodb://localhost/mean');


unuko.modules = {};
unuko.modules.menu = require('./modules/menu')(unuko);
unuko.modules.config = require('./modules/config')(unuko);
unuko.modules.layout = require('./modules/layout')(unuko);
unuko.modules.user = require('./modules/user')(unuko);
unuko.modules.block = require('./modules/block')(unuko);
unuko.modules.entity = require('./modules/entity')(unuko);



unuko.vars = {};
unuko.vars['copyright'] = 'Esta página es Unuko.com';
unuko.vars['about'] = '<p>Acerca de esta página. Esto debería configurable desde el submenú correspondiente</p>';
unuko.vars['basePath'] = __dirname;
unuko.vars['regenerateTemplates'] = true;


unuko.app.use(cookieParser());
unuko.app.use(express.static(__dirname + '/public'));
unuko.app.use(bodyParser.urlencoded());
unuko.app.use(methodOverride('_method'));
unuko.app.set('view engine', 'hbs');

unuko.modules.menu.create('main');
unuko.modules.menu.create('admin', '/admin');

for(var m in unuko.modules) {
	unuko.modules[m].initialize();
}

var _paths = unuko.modules.menu.items('admin');
_paths.forEach(function(element) {
	unuko.app.get(element.path, function(req, res, next) {
		console.log('-----Esto va bien');
		console.log(element);
		req.menu = element;
		next();
	});
});

for(var m in unuko.modules) {
	if(unuko.modules[m].initializeMiddleware) {
		unuko.modules[m].initializeMiddleware();
	}
}

//crear menus
_paths.forEach(function(element) {
	unuko.app[element.method](element.path, function(req, res, next) {
		console.log('---Aquí podemos hacer algo---');
		req.menu = element;
		next();
	})
	if(element.access_callback) {
		unuko.app[element.method](element.path, element.access_callback);
	}
	if(element.callback) {
		unuko.app[element.method](element.path, element.callback);
	} else {
		unuko.app[element.method](element.path, function(req, res) {
			res.send(element)
		});
	}
});




//console.log("getDeep: %j", menu.getDeep('admin'));


unuko.app.listen(3000);
