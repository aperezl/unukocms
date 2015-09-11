var fs = require('fs');
var hbs = require('hbs');

//Sistema de plantillas
//Core:
var hjs = require
module.exports = function(unuko) {
  var module = {};
  module.info = {
    name: 'layout',
    description: 'Layout System',
    required: true
  };

  module.initialize = function() {
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

    unuko.createContainer = function(layout, obj) {
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

    unuko.createRow = function(layout, container, obj) {
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

    unuko.createCol = function(layout, row, obj) {
      var _col = {
        name: obj.name,
        title: obj.title,
        template: 'col',
        row: row,
        container: unuko.html[layout].row[row].container,
        class: obj.class,
        layout: []
      }
      console.log('----Creando columna', row);

      var _row = unuko.html[layout].row[row];
      //console.log(_row);
      unuko.html[layout].col = unuko.html[layout].col || {};
      unuko.html[layout].col[obj.name] = _col;
      _row.layout.push(_col);
      //unuko.html[layout].row[row].layout[obj.name] = unuko.html[layout].col[obj.name];
    }

    unuko.createBlock = function(res, layout, col, block) {
      //res.html.col[col].layout[block.name] = block;
      var _container = res.html.col[col].container;
      var _row = res.html.col[col].row;

      var _container = res.html.layout.filter(function(element) {
        console.log(element)
        return element.name === _container;
      })[0];
      var _row = _container.layout.filter(function(element) {
        return element.name === _row;
      })[0];
      var _col = _row.layout.filter(function(element) {
        return element.name === col;
      })[0];
      _col.layout.push(block);
      //res.send(res.html);
      console.log(block)
      //

      //res.html.layout[_container].layout[_row].layout[col].layout[block.name] = block;
    }



    console.log('--Creación de Contenedores');
    unuko.createContainer('main', {title: 'header', name: 'header'});
    unuko.createContainer('main', {title: 'main', name: 'main'});
    unuko.createContainer('main', {title: 'footer', name: 'footer'});
    console.log('--Creación de Rows');

    unuko.createRow('main', 'header', {title: 'header1', name: 'header1'});
    unuko.createRow('main', 'header', {title: 'header2', name: 'header2'});
    unuko.createRow('main', 'main', {title: 'main', name: 'main'});
    unuko.createRow('main', 'footer', {title: 'footer', name: 'footer'});
    console.log('--Creación de Cols');

    unuko.createCol('main', 'header1', {title: 'header1', name: 'header1', class: 'col-sm-3'});
    unuko.createCol('main', 'header2', {title: 'header2', name: 'header2', class: 'col-sm-12'});
    unuko.createCol('main', 'main', {title: 'Content', name: 'content', class: 'col-sm-9'});
    unuko.createCol('main', 'main', {title: 'Sidebar', name: 'sidebar', class: 'col-sm-3'});
    unuko.createCol('main', 'footer', {title: 'footer', name: 'footer', class: 'col-sm-12'});



    console.log(unuko.html['main']);


    unuko.registerPartial = function(path, partial) {
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
      //console.log('-->Cargado ' + partial);
    };

    unuko.registerHelper = function(name, func) {
      hbs.registerHelper(name, func)
    };

  }

  module.registerModule = function() {
    //Register partials
    unuko.registerPartial(__dirname + '/templates/', 'html');
    unuko.registerPartial(__dirname + '/templates/', 'page');
    unuko.registerPartial(__dirname + '/templates/', 'sidebar');
    unuko.registerPartial(__dirname + '/templates/', 'about');
    unuko.registerPartial(__dirname + '/templates/', 'section');
    unuko.registerPartial(__dirname + '/templates/', 'block');
    unuko.registerPartial(__dirname + '/templates/', 'container');
    unuko.registerPartial(__dirname + '/templates/', 'row');
    unuko.registerPartial(__dirname + '/templates/', 'col');
    unuko.registerPartial(__dirname + '/templates/', 'mainmenu');
    //Config
    unuko.registerPartial(__dirname + '/templates/', 'config.layout');
    unuko.registerPartial(__dirname + '/templates/', 'config.struct');
    unuko.registerPartial(__dirname + '/templates/', 'config.example');

    //Helpers
    unuko.registerHelper('fields', function(items, options) {
      var output = '<div class="fields">';
      console.log('----fields')
      console.log(items.entity);
      for(var field in items.fields) {
        output += '<div class="field">';
        output += '<div class="field-label">';
        output += items.fields[field].title;
        output += '</div>'
        output += '<div class="field-field">';
        output += items.entity.fields[field];
        output += '</div>';
        output += '</div>'
      }
      output = output + '</div>';
      return output;
    });

    unuko.registerHelper('fieldsEdit', function(items, options) {
      var output = '<div class="fields fields-edit">';
      for(var field in items.fields) {
        output += '<div class="form-group">';
        output += '  <label form="' + items.fields[field].name + '">' + items.fields[field].title + '</label>';
        switch (items.fields[field].type) {
          case 'text':
            output += '  <input type="text" class="form-control" name="fields[' + items.fields[field].name + ']" id="fields-' + items.fields[field].name + '" value="' + items.entity.fields[items.fields[field].name] + '" />';
            break;
          case 'textarea':
            output += '<textarea class="form-control" rows="10" name="fields[' + items.fields[field].name + ']" id="fields-' + items.fields[field].name + '">';
            if(items.entity.fields[items.fields[field].name]) {
              output += items.entity.fields[items.fields[field].name];
            }
            output += '</textarea>';
            break;
          case 'select':
            output += '<select class="form-control" name="fields[' + items.fields[field].name + ']">';
            for(var option in items.fields[items.fields[field].name].options) {

              var selected = '';
              if(option === items.entity.fields[items.fields[field].name]) {
                selected = ' selected="selected"'
              }

              output += '<option value="' + option + '"' + selected + '>' + items.fields[items.fields[field].name].options[option] + '</option>';
            }
            output += '</select>';
            break;
          default:
        }
        output += '</div>';
      }
      output += '</div>';
      return output;
    });

  }

  module.initializeMiddelware = function() {
    var renderBlocks = function(obj) {
      for(var item in obj) {
        if(obj[item].template) {
          obj[item].template = unuko.compiles[obj[item].template];
        }
        if(obj[item].layout) {
          renderTemplates(obj[item].layout);
        }
      }
    };

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
      res.html = JSON.parse(JSON.stringify(unuko.html['main']));
      res.blocks = JSON.parse(JSON.stringify(unuko.blocks));
      //Functions Inject

      //Load blocks
      unuko.createBlock(res, 'main', 'sidebar', res.blocks['login']);
      unuko.createBlock(res, 'main', 'sidebar', res.blocks['about']);
      unuko.createBlock(res, 'main', 'sidebar', res.blocks['userinfo']);
      unuko.createBlock(res, 'main', 'content', res.blocks['breadcrumb']);

      unuko.createBlock(res, 'main', 'header2', res.blocks['mainmenu']);
      unuko.createBlock(res, 'main', 'header1', res.blocks['logo']);
      unuko.createBlock(res, 'main', 'footer', res.blocks['copyright']);
      //res.send(unuko.blocks)


      unuko.setBlockPosition = function(layout, col, block) {
        console.log('->Asignando posición');
        unuko.blocks[block].position = col;
      }
      for(var b in res.blocks) {
        console.log('->Procesando bloque', res.blocks[b]);
        //unuko.createBlock(req, 'main', res.blo)

        //unuko.createBlock(res, 'main', res.blocks[b])
      }

      renderTemplates(res.html.layout);

      //res.send(res.html);
      console.timeEnd('clone');

      //Refactorizo res para añadir setContent

      res.setContent = function(content) {
        var _container = res.html.layout.filter(function(element) {
          console.log(element)
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
        res.html.title = template.title;
        //res.html.layout['main'].layout['main'].layout['content'].layout[template.title] = {

        var _container = res.html.layout.filter(function(element) {
          console.log(element)
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

  module.initializeRoute = function() {
    unuko.app.get('/layout', function(req, res) {
      var text = '<p>listado de elementos</p>';
      text += '<p><a href="/layout/partials">Partials</a></p>';
      text += '<p><a href="/layout/struct">Estructura</a></p>';
      text += '<p><a href="/layout/example">Ejemplo</a></p>';
      res.setContent(text);
      res.send(unuko.render(res.html));
    })


    unuko.path({
      name: 'config.layout',
      title: 'config.layout',
      url: '/admin/layout/partials',
      method: 'get',
      callback: function(req, res) {
        res.setTemplate({
          title: 'config.layout',
          name: 'config.layout',
          template: unuko.compiles['config.layout'],
          data: {
            partials: unuko.partials
          }
        });
        res.send(unuko.render(res.html));
      },
      access_callback: unuko.hasPermission,
      access_params: 'view roles',
    });

    unuko.app.get('/layout/partials', function(req, res) {
      res.setTemplate({
        title: 'config.layout',
        name: 'config.layout',
        template: unuko.compiles['config.layout'],
        data: {
          partials: unuko.partials
        }
      });
      res.send(unuko.render(res.html));
    });

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
  return module;

};
