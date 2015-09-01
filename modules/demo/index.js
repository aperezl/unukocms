module.exports = function(unuko) {
  var module = {};
  module.info = {
    name: 'demo',
    description: 'Demo',
    required: true
  };

  var demoHandler = function(req, res) {
    //console.log(id);
    res.setContent('<h1>Soy el elemento ' + req.params.demoId + '</h1><p><a href="/demo">Ir a demo</a></p>');
    res.send(unuko.render(res.html));
  }

  module.initialize = function() {
    unuko.alias={};
    unuko.registerAlias = function(name, param, handler) {
      unuko.alias[name] = {
        param: param,
        handler: handler
      };
    }
  }

  module.registerModule = function() {
    unuko.registerAlias('articulo1', '1', demoHandler);
    unuko.registerAlias('articulo2', '2', demoHandler);
    unuko.registerAlias('acerca-de-este-sistema-cms-que-tiene-buena-pinta', 'acerca-de-este-sistema-cms-que-tiene-buena-pinta', demoHandler);
    unuko.registerPartial(__dirname + '/templates/', 'breadcrumb');

  }

  module.initializeMiddelware = function() {
  
  }

  module.initializeRoute = function() {


    var demo2 = function(req, res) {
      res.send('ok2')
    }

    unuko.path({
      name: 'demo2',
      title: 'demo2',
      url: '/demo2',
      method: 'get',
      callback: demo2,
      access_callback: unuko.hasPermission,
      access_params: 'view roles'
    });

    unuko.app.get('/demo', function(req, res) {
      var text = '<a href="/">Volver</a>';
      text += '<p><a href="/demo/1">Ir a demo/1</a></p>';
      text += '<p><a href="/demo/2">Ir a demo/2</a></p>';
      text += '<p><a href="/demo/3">Ir a demo/3</a></p>';
      text += '<p><a href="/demo/4">Ir a demo/4</a></p>';
      text += '<p><a href="/demo/5">Ir a demo/5</a></p>';
      res.setContent(text);
      res.send(unuko.render(res.html));
    });

    unuko.app.get('/a', function(req, res) {
      res.send('aquí si');
    });

    unuko.app.get('/demo/:demoId', demoHandler);

    unuko.app.get('/acercade', function(req, res) {
      res.setContent('<h1>Yo mismo</h1>');
      res.send(unuko.render(res.html));
    });


  }

  return module;


}
