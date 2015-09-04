var bcrypt = require('bcrypt-nodejs');
var jwt = require('jwt-simple');
var key = 'key_de_prueba';

module.exports = function(unuko) {
  var _module = {};
  _module.info = {
    name: 'user',
    description: 'User System',
    required: true
  };

    unuko.roles = {};
    unuko.permissions = {};

  _module.initialize = function() {
  	console.log('inicializado usuario');
  	unuko.modules.layout.registerPartial(__dirname + '/templates/', 'login');
  	unuko.modules.layout.registerPartial(__dirname + '/templates/', 'user.list');
  	unuko.modules.layout.registerPartial(__dirname + '/templates/', 'user.list.edit');

  	unuko.modules.menu.add('admin', {
		title: 'User Page',
		name: 'user',
		path: '/user',
		parent: 'home',
		callback: function(req, res) {
			var menu = unuko.modules.menu.get('admin', 'user');
			res.setTemplate({
				template: unuko.compiles['generic.menu'],
				data: {
					menu: menu
				}
			});
			res.render('layout');
		},
		visible: true,
		//access_callback: unuko.modules.user.hasPermission,
  		//access_params: 'view roles',
	});

	 unuko.modules.menu.add('admin', {
	 	title: 'Login',
	 	name: 'user.login',
	 	path: '/user/login',
	 	parent: 'user',
	 	callback: function(req, res) {
	 		res.setTemplate({
	        	template: unuko.compiles['login']
			});
	 		res.render('layout');
	 	}
    });

	 unuko.modules.menu.add('admin', {
	 	title: 'Login',
	 	name: 'user.login.post',
	 	path: '/user/login',
	 	parent: 'user',
	 	method: 'post',
	 	callback: function(req, res) {
	 		if(req.body.username && req.body.password) {

		        unuko.models.User.findOne({
		          username: req.body.username,
		          password: req.body.password
		        }, function(err, user) {
		          if(err) console.log(err);
		          if(user) {
		            var _token = createToken(user);
		            res.cookie('unuko_token', _token);
		            res.redirect('/admin/user');
		          } else {
		            res.send('Usuario o contraseña erroneo, no se puede continuar');
		          }
		        });
		      } else {
		        res.send('Falta información');
		      }
	 	}
	 });
	 unuko.modules.menu.add('admin', {
	 	title: 'User list',
	 	name: 'user.list',
	 	path: '/user/list',
	 	parent: 'user',
	 	callback: function(req, res) {
	      unuko.models.User.find({})
	      .populate('roles')
	      .exec(function(err, users) {
	        res.setTemplate({
	          template: unuko.compiles['user.list'],
	          data: {
	            users: users
	          }
	        });
	        res.render('layout');
	      });

	    }
	 });

	  unuko.modules.menu.add('admin', {
	      name: 'user_list_edit',
	      title: 'User List Edit',
	      path: '/user/list/:username',
		  parent: 'user.list',
	      callback: function(req, res) {res.send('ok')}
    });

/*
	   var user_list = function(req, res) {
      unuko.models.User.find({})
      .populate('roles')
      .exec(function(err, users) {
        res.setTemplate({
          title: 'roles.list',
          name: 'roles.list',
          template: unuko.compiles['user.list'],
          data: {
            users: users
          }
        });
        res.send(unuko.render(res.html));
      });

    };

    unuko.path({
      name: 'user_list',
      title: 'User List',
      url: '/user/list',
      method: 'get',
      callback: user_list
    })
*/
  };

	_module.initializeMiddleware = function() {
		unuko.app.use(function(req, res, next) {
			req.user = {username: 'admin', isAdmin: true};
			next();
		});
	}


  _module.registerPermission = function(name) {
      unuko.models.Permission.findOne({name: name}, function(err, permission) {
        if(err) console.log('err', err);
        if(!permission) {
          var _permission =  new unuko.models.Permission();
          _permission.name = name;
          _permission.save(function(err, permission) {
            if(err) console.log('err', err);
          })
        }
      });
    };

    _module.registerRole = function(name) {
      unuko.models.Role.findOne({name: name}, function(err, role) {
        if(err) console.log('err', err);
        if(!role) {
          var _role =  new unuko.models.Role();
          _role.name = name;
          _role.save(function(err, role) {
            if(err) console.log('err', err);
          });
        }

      });
    };

    _module.hasPermission = function(user, permission, cb) {
      console.time('hasPermission');
      var permissionId = unuko.permissions[permission]._id;
      var hasPermission = false;
      user.roles.forEach(function(role) {
        role.permissions.forEach(function(permission) {
          if(permission.toString() === permissionId.toString()) {
            hasPermission = true;
          }
        })
      });
      if(hasPermission) {
        cb(true);
      } else {
        cb(false);
      }
      console.timeEnd('hasPermission');
      return hasPermission;
    };


    //Definir schemas. Luego lo integraré en el CORE, pero de momento lo hacemos aquí y lo inyectamos en el objeto unuko
      var userSchema = new unuko.Schema({
    	username: String,
    	password: String,
      roles: [{type: unuko.Schema.Types.ObjectId, ref: 'Role'}],
    	created: {type: Date, default: Date.now }
    	//fields: unuko.Schema.Types.Mixed
    });

    //Modelos de permisos y roles
    //Definir schemas. Luego lo integraré en el CORE, pero de momento lo hacemos aquí y lo inyectamos en el objeto unuko
    var permissionSchema = new unuko.Schema({
      name: String
    });
    permissionSchema.statics.createPermission = function(permission, cb) {
      var _permission = new unuko.models.Permission();
      _permission.name = permission;
      _permission.save(function(err, _permission) {
        if(err) console.log(err);
        cb();
      });
    }

    var roleSchema = new unuko.Schema({
      name: String,
      permissions: [{type: unuko.Schema.Types.ObjectId, ref: 'Permission'}]
    });
    roleSchema.statics.createRole = function(name, cb) {
      var _role = new unuko.models.Role();
      _role.name = name;
      _role.save(function(err, _role) {
        if(err) console.log(err);
        cb();
      })
    }

    roleSchema.methods.addPermission = function(permission, cb) {
      this.permissions.push(permission);
      this.save(function(err, role) {
        if(err) console.log(err);
        cb();
      })
    };


    unuko.models.Permission = unuko.mongoose.model('Permission', permissionSchema);
    unuko.models.Role = unuko.mongoose.model('Role', roleSchema);
    unuko.models.User = unuko.mongoose.model('User', userSchema);

	var createToken = function(user) {
      var payload = {
        sub: user._id,
        username: user.username,
        //isAdmin: user.isAdmin
      };
      return jwt.encode(payload, key);
    }

  return _module;
}
