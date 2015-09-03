module.exports = function(unuko) {
	var _module = {};
	var menu = {};
	_module.create = function(name, base) {
		menu[name] = {
			name: name,
			base: base,
			items: []
		};
	}

	_module.list = function() {
		var _output = [];
		for(var m in menu) {
			_output.push(m);
		}
		return _output;
	}
	_module.add = function(name, item) {
		menu[name].items.push({
			name: item.name,
			title: item.title,
			type: name,
			path: menu[name].base + item.path,
			callback: item.callback,
			parent: item.parent ? item.parent : '',
			visible: item.visible,
			access_callback: item.access_callback,
			access_params: item.access_params
		});
	}
	_module.items = function(name) {
		return menu[name].items;
	}

	_module.get = function(name, level) {
		var level = level || '';
		var _output = menu[name].items.filter(function(element) {
			return element.parent === level;
		});
		return _output;
	}

	_module.getDeep = function(name) {
		console.time('getDeep');
		var level = _module.get(name);
		var _deep = level.map(function(element) {
			element.childrens = _module.get(name, element.name);
			return element;
		});
		console.timeEnd('getDeep');
		return _deep;
	}

	_module.getItem = function(name) {
		var item = menu['admin'].items.filter(function(element) {
			return element.name === name;
		})[0];
		console.log('name', name);
		return item;
	}

	_module.breadcrumb = function(name) {
		var _breadcrumb = [];
		var bc = function(name, b) {
			var item = _module.getItem(name);
			if(item.parent) {
				bc(item.parent, b);
			} 
			b.push(item);
			return b;
		}
		return bc(name, _breadcrumb);
	}

	_module.initialize = function() {
		unuko.modules.menu.add('admin', {
			name: 'content',
			title: 'Content',
			parent: 'home',
			path: '/content',
			visible: true
		});

		unuko.modules.menu.add('admin', {
			name: 'content.new',
			title: 'New Content',
			path: '/content/new',
			parent: 'content',
			visible: true
		});

		unuko.modules.menu.add('admin', {
			name: 'content.edit',
			title: 'Edit Content',
			path: '/content/:id/edit',
			parent: 'content',
			visible: false
		});

		_module.initializeMiddleware = function() {
			unuko.app.use(function(req, res, next) {
				console.log('---Middleware instalado');
				if(req.menu) {
					res.locals.foo = 'bar';
					unuko.app.locals.bar = 'foo';
					res.locals.breadcrumb = _module.breadcrumb(req.menu.name);
				} else {
					res.locals.breadcrumb = {title: 'Undefined breadcrumb'};
				}
				next();
			});
		}


	}
	return _module;
}
