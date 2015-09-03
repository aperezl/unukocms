module.exports = function(unuko) {
	var _module = {};

	_module.hasPermission = function(req, res, next) {
		if(req.user.isAdmin) {
			next();
		} else {
			res.send('sin hasPermission')
		}
	}

	_module.initialize = function() {

	}

	_module.initializeMiddleware = function() {
		unuko.app.use(function(req, res, next) {
			req.user = {username: 'admin', isAdmin: true};
			next();
		});
	}
	return _module;
}
