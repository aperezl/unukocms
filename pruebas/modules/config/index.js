module.exports = function(unuko) {
	var _module = {};

	var main = function(req, res) {
		var menu = unuko.modules.menu.get('admin', 'home');
		res.setTemplate({
			template: unuko.compiles['generic.menu'],
			data: {
				menu: menu
			}
		});
		//res.send(unuko.modules.layout.render(res.html));
		res.render('layout');
	}

	var config = function(req, res) {

		//res.send('ok');
		res.render('layout');
	}

	_module.initialize = function() {
		unuko.modules.menu.add('admin', {
			title: 'Config',
			name: 'config',
			path: '/config',
			parent: 'home',
			callback: config,
			visible: true,
			access_callback: unuko.modules.user.hasPermission,
      access_params: 'view roles',
		});

		unuko.modules.menu.add('admin', {
			title: 'Config.param',
			name: 'config.param',
			path: '/config/:idParam',
			parent: 'config',
			callback: config,
			visible: true,
			access_callback: unuko.modules.user.hasPermission,
      access_params: 'view roles',
		});

		unuko.modules.menu.add('admin', {
			title: 'Admin',
			name: 'home',
			path: '/',
			callback: main,
			visible: true
		});
	}


	return _module;
}
