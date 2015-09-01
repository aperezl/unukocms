module.exports = function(unuko) {

  var module = {};
  module.info = {
    name: 'config',
    description: 'Config System',
    required: true
  };

  module.initialize = function() {

  }

  module.registerModule = function() {
    unuko.registerPartial(__dirname + '/templates/', 'config.form');
  }

  module.initializeRoute = function() {
    var config = {};

    unuko.app.get('/config', function(req, res) {
      res.setContent('Bienvenido a la configuración');
      res.setTemplate({
        title: 'config',
        name: 'config',
        template: unuko.compiles['config.form'],
        data: {
          vars: unuko.vars
        }
      });
      res.send(unuko.render(res.html));
    });

    unuko.app.post('/config', function(req, res) {
      unuko.vars['sitename'] = req.body.sitename;
      res.redirect('/config')
    });
  }
  return module;
}
