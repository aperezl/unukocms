module.exports = function(unuko) {
	var _module = {};
	var menu = {};
	_module.create = function(name) {
		menu[name] = {name: name, items: []};
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
			path: item.path,
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

	_module.breadcrumb = function(item) {
		return menu['admin'].items.filter(function(element) {
			return element.name === item;
		})[0];
	}

	_module.initialize = function() {
		unuko.modules.menu.add('admin', {name: 'content', path: '/content', visible: true});
		unuko.modules.menu.add('admin', {name: 'content.new', path: '/content/new', parent: 'content', visible: true});
		unuko.modules.menu.add('admin', {name: 'content.edit', path: '/content/:id/edit', parent: 'content', visible: false});

		
	}
	return _module;
}
