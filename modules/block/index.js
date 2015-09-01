module.exports = function(unuko) {
  var module = {};
  module.info = {
    name: 'block',
    description: 'Block System',
    required: true
  };

  module.initialize = function() {
    unuko.blocks = {};

    unuko.registerBlock = function(name, title, content, layout) {
      unuko.blocks[name] = {
        name:  name,
        title: title,
        content: content,
        template: 'block',
        layout: layout || {}
      }
    }

  }

  module.registerModule = function() {
    unuko.registerPartial(__dirname + '/templates/', 'edit.block');

    unuko.registerBlock('login', 'login', '', {
      'login': {
        name: 'login',
        title: 'login',
        template: 'login'
      }
    });
    unuko.registerBlock('about', 'about', unuko.vars['about'], {
      'about': {
        name: 'about',
        title: 'about',
        template: 'about'
      }
    });

      unuko.registerBlock('breadcrumb', 'breadcrumb', 'Se encuentra en: ');
      unuko.registerBlock('logo', 'logo', '<a href="/">Logo</a>');
      unuko.registerBlock('copyright', 'copyright', unuko.vars['copyright']);


      unuko.blocks['mainmenu'] = {
        title: 'mainmenu',
        name: 'mainmenu',
        template: 'block',
        layout: {
          'mainmenu': {
            title: 'mainmenu',
            name: 'mainmenu',
            template: 'mainmenu',
            menus: [
              {
                href: '/',
                title: 'Inicio'
              },
              {
                href: '/demo',
                title: 'Demo'
              },
              {
                href: '/entity',
                title: 'Entity'
              },
              {
                href: '/user',
                title: 'Users'
              },
              {
                href: '/acercade',
                title: 'Acerca de'
              },
              {
                href: '/layout',
                title: 'Layout'
              }
            ]
          }
        }
      }
    }

    module.initializeRoute = function() {
      unuko.app.get('/blocks/edit/:name', function(req, res) {
        console.log(unuko.blocks[req.params.name]);
        res.setTemplate({
          title: 'config',
          name: 'config',
          template: unuko.compiles['edit.block'],
          data: {
            block: unuko.blocks[req.params.name]
          }
        });
        res.send(unuko.render(res.html));
      });

      unuko.app.put('/blocks/edit/:name', function(req, res) {
        unuko.blocks[req.body.name].title = req.body.title;
        unuko.blocks[req.body.name].content = req.body.content;
        res.redirect('/');
      });

    }
  return module;
}
