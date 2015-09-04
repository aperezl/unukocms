var fs = require('fs');
var hbs = require('hbs');

//Sistema de plantillas
//Core:
module.exports = function(unuko) {
  var _module = {};
  _module.info = {
    name: 'layout',
    description: 'Layout System',
    required: true
  };


  _module.initialize = function() {
    hbs.localsAsTemplateData(unuko.app);
    unuko.partials = {};
    unuko.compiles = {};
    unuko.html = {};
    unuko.html['main'] = {};
    //1.- Crear el/los layout generales
    //
    unuko.html['main'] = {
      title: 'aaa',
      js: ['librerias', 'js', 'a', 'renderizar'],
      css: ['classes', 'css', 'a', 'renderizar'],
      layout: []
    }

    unuko.html['admin'] = {};
    unuko.html['admin'].layout = {};



    console.log('--Creación de Contenedores');
    _module.createContainer('main', {title: 'header', name: 'header'});
    _module.createContainer('main', {title: 'main', name: 'main'});
    _module.createContainer('main', {title: 'footer', name: 'footer'});
    console.log('--Creación de Rows');

    _module.createRow('main', 'header', {title: 'header1', name: 'header1'});
    _module.createRow('main', 'header', {title: 'header2', name: 'header2'});
    _module.createRow('main', 'main', {title: 'main', name: 'main'});
    _module.createRow('main', 'footer', {title: 'footer', name: 'footer'});
    console.log('--Creación de Cols');

    _module.createCol('main', 'header1', {title: 'header1', name: 'header1', class: 'col-sm-3'});
    _module.createCol('main', 'header2', {title: 'header2', name: 'header2', class: 'col-sm-12'});
    _module.createCol('main', 'main', {title: 'Content', name: 'content', class: 'col-sm-9'});
    _module.createCol('main', 'main', {title: 'Sidebar', name: 'sidebar', class: 'col-sm-3'});
    _module.createCol('main', 'footer', {title: 'footer', name: 'footer', class: 'col-sm-12'});


    //Register partials
    _module.registerPartial(__dirname + '/templates/', 'html');
    _module.registerPartial(__dirname + '/templates/', 'container');
    _module.registerPartial(__dirname + '/templates/', 'row');
    _module.registerPartial(__dirname + '/templates/', 'col');
    //Config
    _module.registerPartial(__dirname + '/templates/', 'config');
    _module.registerPartial(__dirname + '/templates/', 'config.layout');
    //unuko.registerPartial(__dirname + '/templates/', 'config.struct');
    //unuko.registerPartial(__dirname + '/templates/', 'config.example');

    //Generic
    _module.registerPartial(__dirname + '/templates/', 'generic.menu');

    unuko.modules.menu.add('admin', {
      title: 'Layout',
      name: 'layout',
      parent: 'home',
      path: '/layout',
      callback: function(req, res) {
        var menu = unuko.modules.menu.get('admin', 'layout');
        res.setTemplate({
          template: unuko.compiles['generic.menu'],
          data: {
            menu: menu
          }
        });
        //res.send(_module.render(res.html));
        res.render('layout');
      },
      visible: true
    });

    unuko.modules.menu.add('admin', {
      title: 'Partials',
      name: 'layout.partials',
      path: '/layout/partials',
      parent: 'layout',
      callback: function(req, res) {
        res.setTemplate({
          template: unuko.compiles['config.layout'],
          data: {
            partials: unuko.partials
          }
        });
        //res.send(_module.render(res.html));
        res.render('layout');
      },
      visible: true,
      access_callback: unuko.modules.user.hasPermission,
      access_params: 'view roles'
    });

  }

  _module.render = function(html) {
    console.time('render');
    var source = '<!-- Render generator -->\n';
    source += '{{>html}}\n';
    source += '<!-- /Render generator -->\n'
    var template = hbs.compile(source);
    var result = template(html);

    console.timeEnd('render');
    return result;
  }

  _module.createContainer = function(layout, obj) {
    var _container = {
      name: obj.name,
      title: obj.title,
      template: 'container',
      layout: []
    };

    unuko.html[layout].container = unuko.html[layout].container || {};
    unuko.html[layout].container[obj.name] = _container;
    unuko.html[layout].layout.push(_container);
  }

  _module.createRow = function(layout, container, obj) {
    var _row = {
      name: obj.name,
      title: obj.title,
      template: 'row',
      container: container,
      layout: []
    }
    var _container = unuko.html[layout].container[container];
    unuko.html[layout].row = unuko.html[layout].row || {};
    unuko.html[layout].row [obj.name] = _row;
    _container.layout.push(_row);
  }

  _module.createCol = function(layout, row, obj) {
    var _col = {
      name: obj.name,
      title: obj.title,
      template: 'col',
      row: row,
      container: unuko.html[layout].row[row].container,
      class: obj.class,
      layout: []
    }
    var _row = unuko.html[layout].row[row];
    unuko.html[layout].col = unuko.html[layout].col || {};
    unuko.html[layout].col[obj.name] = _col;
    _row.layout.push(_col);
  }


  _module.registerPartial = function(path, partial) {
    var _path;
    fs.exists(__dirname + '/themes/demo1/' + partial + '.hbs', function(exists) {
      unuko.partials[partial] = unuko.partials[partial] || {};
      unuko.partials[partial].originPath = unuko.partials[partial].originPath || path;
      if(exists) {
        _path = __dirname + '/themes/demo1/';
      } else {
        _path = unuko.partials[partial].originPath || path;
      }
      unuko.partials[partial].name = partial;
      unuko.partials[partial].path = _path;
      unuko.partials[partial].shortpath = _path.split(unuko.vars['basePath'])[1];
      unuko.partials[partial].shortpathOrigin = unuko.partials[partial].originPath.split(unuko.vars['basePath'])[1];
      hbs.registerPartial(partial, fs.readFileSync(_path + partial + '.hbs', 'utf8'));
      unuko.compiles[partial] = hbs.compile(partial);

    })
  };

  _module.registerHelper = function(name, func) {
    hbs.registerHelper(name, func)
  };




  _module.initializeMiddleware = function() {

    var renderTemplates = function(obj) {
      //obj.forEach(function(element, index, array) {

      for(var i=0, j=obj.length;i<j;i++) {
        if(obj[i].template) {
          obj[i].template = unuko.compiles[obj[i].template];
        }
        if(obj[i].layout) {
          renderTemplates(obj[i].layout);
        }
      }

      //});
    }
    unuko.app.use(function(req, res, next) {
      //res.send(unuko.html['main']);
      console.time('clone');
      res.locals.html = JSON.parse(JSON.stringify(unuko.html['main']));
      renderTemplates(res.locals.html.layout);
      console.timeEnd('clone');

      //Refactorizo res para añadir setContent
      res.setContent = function(content) {
        var _container = res.html.layout.filter(function(element) {
          return element.name === 'main';
        })[0];
        var _row = _container.layout.filter(function(element) {
          return element.name === 'main';
        })[0];
        var _col = _row.layout.filter(function(element) {
          return element.name === 'content';
        })[0];

        _col.content = content;
      }

      res.setTemplate = function(template) {
        res.locals.html.title = template.title;
        //res.html.layout['main'].layout['main'].layout['content'].layout[template.title] = {

        var _container = res.locals.html.layout.filter(function(element) {
          return element.name === 'main';
        })[0];
        var _row = _container.layout.filter(function(element) {
          return element.name === 'main';
        })[0];
        var _col = _row.layout.filter(function(element) {
          return element.name === 'content';
        })[0];

        _col.layout.push({
          title: template.title,
          name: template.name,
          template: template.template,
          data: template.data
        });
      };
      next();
    });
  }

  _module.initializeRoute = function() {
    unuko.app.get('/layout', function(req, res) {
      var text = '<p>listado de elementos</p>';
      text += '<p><a href="/layout/partials">Partials</a></p>';
      text += '<p><a href="/layout/struct">Estructura</a></p>';
      text += '<p><a href="/layout/example">Ejemplo</a></p>';
      res.setContent(text);
      res.send(unuko.render(res.html));
    })


    unuko.app.get('/layout/example', function(req, res) {
      res.setTemplate({
        title: 'config.example',
        name: 'config.example',
        template: unuko.compiles['config.example']
      });
      res.send(unuko.render(res.html));
    });

    unuko.app.get('/layout/struct', function(req, res) {
      res.setTemplate({
        title: 'config.struct',
        name: 'config.struct',
        template: unuko.compiles['config.struct'],
        data: {
          struct: unuko.html,
          blocks: unuko.blocks
        }
      });
      res.send(unuko.render(res.html));
    });

    unuko.app.get('/layout/partials/regenerate', function(req, res) {
      for(var partial in unuko.partials) {
        unuko.registerPartial(unuko.partials[partial].path, unuko.partials[partial].name);
      }
      res.redirect('/layout/Partials');
    });
  }
  return _module;

};
