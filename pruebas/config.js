module.exports = function(unuko) {
	var _module = {};

	var main = function(req, res) {
		var items = unuko.modules.menu.items('admin');
		var _output = '';
		items.forEach(function(element) {
			if(element.visible) {
				_output += '<li><a href="' + element.path + '">' + element.name + '</a></li>'
			}
		});
		res.send(_output);
	}

	var config = function(req, res) {

		res.send(unuko.modules.menu.breadcrumb('config'));
	}

	_module.initialize = function() {
		unuko.modules.menu.add('admin', {
			name: 'config',
			path: '/config',
			callback: config,
			visible: true,
			access_callback: unuko.modules.roles.hasPermission,
      		access_params: 'view roles',
		});
		
		unuko.modules.menu.add('admin', {
			name: 'inicio',
			path: '/',
			callback: main,
			visible: true
		});
	}
	

	return _module;
}