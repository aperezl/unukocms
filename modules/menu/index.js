module.exports = function(unuko) {
  var module = {};
  module.info = {
    name: 'menu',
    description: 'Menu System',
    required: true
  };



  module.initialize = function() {
    console.log('Iniciado sistema de menús');
  }

  module.initializeMiddelware = function() {
    //La function Path permitirá enrutar las direcciones, a las vez que permite
    //Crear un menú (que será neceario para mostrar la miga de pan)
    //y gestionar la seguridad del sitio.
    //ejemplo:
    //
    /*
     unuko.path({
      name: 'demo2',
      title: 'Demo2',
      url: '/demo2',
      method: 'get',
      callback: demo2,
      access_callback: unuko.hasPermission,
      access_params: 'view roles',
    })
    */
    unuko.path = function(path) {
      unuko.menu = unuko.menu || {};

      unuko.menu[path.url] = {
        url: path.url,
        title: path.title,
        name: path.name,
        callback_path: path.callback_path,
        parent: path.parent,
        callback: path.callback
      }
      var getItem = function(breadcrumb, item, req, res) {
        var _aux = {};
        _aux.name = item.name;
        _aux._id = item._id;
        if(typeof(item.callback_path) === "function") {
          var _path = item.callback_path()(req, res);
          _aux.title = _path.title;
          _aux.url = _path.url;
        } else {
          _aux.title = item.title;
          _aux.url = item.url;
        }
        if(item.parent) {
          getItem(breadcrumb, unuko.menu[item.parent], req, res);
        }
        breadcrumb.push(_aux);
      }
      unuko.app[path.method](path.url, function(req, res, next) {
        if(path.access_callback) {
          //console.log('callback', path.access_callback);
        }
        //Configuración del menú anidado
        var _breadcrumb = [];
        getItem(_breadcrumb, unuko.menu[unuko.menu[path.url].url], req, res);

        res.blocks.breadcrumb.layout.breadcrumb.data = {
          breadcrumb: _breadcrumb
        }

        if(typeof(path.access_callback) === "function") {
          path.access_callback(req.user, path.access_params, function(access) {
            if(!access) {
              res.send('no tiene permisos');
            } else {
              next();
            }
          });
        } else {
          next();
        }
      });


      unuko.app[path.method](path.url, path.callback);
    };
  }

  return module;

}
