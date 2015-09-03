var hbs = require('hbs');
var async = require('async');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('jwt-simple');
var key = 'key_de_prueba';


module.exports = function(unuko) {
  var module = {};
  module.info = {
    name: 'user',
    description: 'User System',
    required: true
  };



  module.initialize = function() {
    unuko.registerPermission = function(name) {
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

    unuko.registerRole = function(name) {
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

    unuko.hasPermission = function(user, permission, cb) {
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

  }

  module.loadModels = function() {
    unuko.roles = {};
    unuko.permissions = {};

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

    //TODO: LLevarlo al sitio correcto
    unuko.models.Permission.find({}, function(err, permissions) {
      unuko.permissions = {};
      permissions.forEach(function(permission) {
        unuko.permissions[permission.name] = {
          _id: permission._id,
          name: permission.name
        };
      });
    });

    unuko.models.Role.find({}, function(err, roles) {
      unuko.roles = {};
      roles.forEach(function(role) {
        unuko.roles[role.name] = role;
      });
    });
  }

  module.registerModule = function() {
    unuko.registerPartial(__dirname + '/templates/', 'login');
    unuko.registerPartial(__dirname + '/templates/', 'config.login');
    unuko.registerPartial(__dirname + '/templates/', 'config.register');
    unuko.registerPartial(__dirname + '/templates/', 'roles.list');
    unuko.registerPartial(__dirname + '/templates/', 'user.list');
    unuko.registerPartial(__dirname + '/templates/', 'user.list.edit');


    unuko.registerPartial(__dirname + '/templates/', 'userinfo')

    unuko.registerPermission('user login');
    unuko.registerPermission('user register');
    unuko.registerPermission('view roles');
    unuko.registerPermission('update roles');

    unuko.registerRole('anonymous');
    unuko.registerRole('registed');
    unuko.registerRole('administrator');


    unuko.registerBlock('userinfo', 'userinfo', '', {
      name: 'userinfo',
      title: 'userinfo',
      template: 'userinfo',
      data: 'data de prueba'
    });

    unuko.registerHelper('user_roles', function(items, options) {
      var output;
      console.time('search perms');
      for(var permission in items.permissions) {
        var permissionId = items.permissions[permission]._id;
        output += '<tr>';
        output += '<td>' + permission + '</td>';
        for(var role in items.roles) {


          var hasPerm = false;
          items.roles[role].permissions.forEach(function(p) {

            if(p.toString() === permissionId.toString()) {
              hasPerm = true;
            }
          });
          var isChecked;
          if(hasPerm) {
            isChecked = ' checked="checked" ';
          } else {
            isChecked = '';
          }
          output += '<td><input type="checkbox" name="' + role + '[' + permissionId + ']"' + isChecked + '>';
        }
        output += '<td><input type="checkbox" name="dd" checked="checked" disabled="disabled">';
        output += '</tr>';
      }
      console.timeEnd('search perms');

      return output
    })

  }

  module.initializeMiddelware = function() {
    unuko.app.use(function(req, res, next) {
      if(req.cookies.unuko_token) {
        var payload = jwt.decode(req.cookies.unuko_token, key);
        unuko.models.User
        .findOne({username: payload.username})
        .populate('roles')
        .exec(function(err, user) {
          if(err) console.log('err', err);
          req.user = user;
          req.user.level = 1;
          next();
        });
      } else {
        //req.user = new unuko.models.User();
        req.user = {
          username: 'anonymous',
          roles: []
        };
        var _anonymous = unuko.roles['anonymous'];
        req.user.roles.push(_anonymous);
        req.user.level = 0;
        next();
      }
    });

    //Se crea un mw para cargar información relevante del usaurio
    unuko.app.use(function(req, res, next) {

      res.blocks.userinfo.layout[0].data = {
        user: req.user
      }
      res.blocks.login.layout[0].data = {
        user:req.user
      }
      next();
    });

  }

  module.initializeRoute = function() {
    var user_roles = function(req, res) {
      res.setTemplate({
        title: 'roles.list',
        name: 'roles.list',
        template: unuko.compiles['roles.list'],
        data: {
          roles: unuko.roles,
          permissions: unuko.permissions
        }
      });
      res.send(unuko.render(res.html));
    };

    unuko.path({
      name: 'user_roles',
      title: 'User Roles',
      url: '/user/roles',
      method: 'get',
      callback: user_roles,
      //access_callback: unuko.hasPermission,
      //access_callback: true,
      access_params: 'view roles'
    });


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

    var user_list_edit = function(req, res) {
      unuko.models.User.findOne({username: req.params.username})
      .exec(function(err, user) {
        var _roles = [];
        for(var element in unuko.roles) {
          var _aux = {};
          _aux.name = element;
          _aux._id = unuko.roles[element]._id;
          _aux.checked = user.roles.indexOf(unuko.roles[element]._id)>=0;

          _roles.push(_aux);
        }
        res.setTemplate({
          title: 'user.list.edit',
          name: 'user.list.edit',
          template: unuko.compiles['user.list.edit'],
          data: {
            user: user,
            roles: unuko.roles,
            _roles: _roles
          }
        });
        res.send(unuko.render(res.html));
      });
    };

    unuko.path({
      name: 'user_list_edit',
      title: 'User List Edit',
      url: '/user/list/:username',
      method: 'get',
      callback: user_list_edit
    });


    unuko.path({
      name: 'user_list_edit_post',
      title: 'User List Edit',
      url: '/user/list/:username',
      method: 'post',
      callback: function(req, res) {
        unuko.models.User.update({username: req.params.username},
        {roles: []},
        function(err, num) {
          if(err) console.log('err', err);
          if(req.body.role) {
            async.forEach(Object.keys(req.body.role), function(role, callback) {
              unuko.models.User.update(
                {username: req.params.username, roles: {$ne: role}},
                {$push: {roles: role}},
                function(err, num) {
                  if(err) console.log('err', err);
                  callback();
                }
              )
            }, function(err) {
              res.redirect('/user/list');
            });
          } else {
            res.redirect('/user/list');
          }
        });
      }
    });

    unuko.app.post('/user/roles', function(req, res) {

      async.forEach(Object.keys(unuko.roles), function(role, callback) {
        unuko.roles[role].permissions = [];
        unuko.models.Role.update({name: role}, {permissions: []}, function(err, num) {


          for(var permission in req.body[role]) {

            unuko.roles[role].permissions.push(permission);
            unuko.models.Role.update(
              {name: role, permissions: {$ne: permission}},
              {$push: {permissions: permission}},
              function(err, num) {
                if(err) console.log('err', err);
                console.log('num', num);
              }
            );
          }
          callback();
        });
      }, function(err) {
        console.log('terminado!')
      });



      res.redirect('/user/roles');
      //res.send('ok');
    });

    unuko.app.get('/user/login', function(req, res) {
      res.setTemplate({
        title: 'config.example',
        name: 'config.example',
        template: unuko.compiles['config.login']
      });
      res.send(unuko.render(res.html));
    });

    unuko.app.get('/user/logout', function(req, res) {
      res.clearCookie('unuko_token');
      res.redirect('/');

    });

    unuko.path({
      name: 'user',
      title: 'user',
      url: '/user',
      method: 'get',
      callback: function(req, res) {
        var text = '<p>listado de elementos</p>';
        text += '<p><a href="/user/login">Login</a></p>';
        text += '<p><a href="/user/register">Register</a></p>';
        text += '<p><a href="/user/list">Users</a></p>';
        text += '<p><a href="/user/roles">Roles</a></p>';

        res.setContent(text);
        res.send(unuko.render(res.html));
      }
    });



    var createToken = function(user) {
      var payload = {
        sub: user._id,
        username: user.username,
        //isAdmin: user.isAdmin
      };
      return jwt.encode(payload, key);
    }

    unuko.app.post('/user/login', function(req, res) {

      if(req.body.username && req.body.password) {

        unuko.models.User.findOne({
          username: req.body.username,
          password: req.body.password
        }, function(err, user) {
          if(err) console.log(err);
          if(user) {
            var _token = createToken(user);
            res.cookie('unuko_token', _token);
            res.redirect('/');
          } else {
            res.send('Usuario o contraseña erroneo, no se puede continuar');
          }
        });
      } else {
        res.send('Falta información');
      }
    });

    //Registro de usuarios
    unuko.app.get('/user/register', function(req, res) {
      res.setTemplate({
        title: 'config.register',
        name: 'config.register',
        template: unuko.compiles['config.register']
      });
      res.send(unuko.render(res.html));
    });

    unuko.app.post('/user/register', function(req, res) {
      if(req.body.username && req.body.password) {
        var user = new unuko.models.User();
        user.username = req.body.username;
        user.password = req.body.password;
        user.save(function(err, user) {
          if(err) console.log(err);
          res.send(user);
        });
      } else {
        res.send('Falta información')
      }
    });

    unuko.app.get('/user/hasrole/:username/:permission', function(req, res) {
      console.time('find role');
      console.time('map role');


      unuko.models.Permission.findOne({name: req.params.permission}, function(err, permission) {
        var permissionId = permission._id;
        if(err) console.log('err', err);
        unuko.models.User
        .findOne({username: req.params.username})
        .populate('roles')
        .exec(function(err, user) {
          if(err) console.log('err', err);
          console.time('map role');
          var hasPermission = false;
          user.roles.forEach(function(role) {
            role.permissions.forEach(function(permission) {
              if(permission.toString() == permissionId.toString()) {
                hasPermission = true;
              }
            });
          });
          if(hasPermission) {
            res.send('Tienes permiso');
          } else {
            res.send('No puedes pasar!!!');
          }
          console.timeEnd('find role');
          console.timeEnd('map role');
        });
      })
    });


  }

  return module;
}
