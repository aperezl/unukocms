var hbs = require('hbs');
var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var cookieParser = require('cookie-parser');

unuko = {};
unuko.hbs = hbs;
unuko.app = express();
unuko.mongoose = require('mongoose');
unuko.models = {};
unuko.Schema = unuko.mongoose.Schema;



unuko.mongoose.connect('mongodb://localhost/mean');

unuko.init = function() {
  //Definir el nuevo proceso de arranque del Sistema
  //La idea es crear un Sistema progresivo, que cargue todos los módulos, y una vez instalados, se
  //dedique a realizar las llamada necesarias para la correcta covivencia.
  //
  //Guión:
  //1.- Load modules (obtenemos la info del módulo (name, description, dependencies, ...)
  //2.- Initialize modules
  //3.- Load Models
  //4.- Register component
  //5.- Initialize mw
  //6.- Initialize routes
  //
  //Este guión debería ser suficiente.
  //Además de la carga, es necesario implementar un sistema de orden de carga para los middlewares
  unuko.vars = {};
  unuko.vars['copyright'] = 'Esta página es Unuko.com';
  unuko.vars['about'] = '<p>Acerca de esta página. Esto debería configurable desde el submenú correspondiente</p>';
  unuko.vars['basePath'] = __dirname;
  unuko.vars['regenerateTemplates'] = false;
  unuko.app.use(cookieParser());
  unuko.app.use(express.static(__dirname + '/public'));
  unuko.app.use(bodyParser.urlencoded());
  unuko.app.use(methodOverride('_method'));

  //Middleware destinado a limpiar la caché
  unuko.app.use(function(req, res, next) {
    if(unuko.vars['regenerateTemplates']) {
      for(var partial in unuko.partials) {
        unuko.registerPartial(unuko.partials[partial].path, unuko.partials[partial].name);
      }
    }
    next();
  })

  var _modules = ['block', 'config', 'entity', 'layout', 'user', 'demo', 'menu'];
  unuko.modules = {};

  //1.- Load modules
  _modules.forEach(function(module) {
    unuko.modules[module] = require('./modules/' + module)(unuko);
  });

  //2.- Initialize modules
  _modules.forEach(function(module) {
    if(unuko.modules[module]) {
      if(unuko.modules[module].initialize) {
        unuko.modules[module].initialize();
      } else {
        console.log('Error en la inicialización del módulo: ' + module);
      }
    } else {
      console.log('Error en la carga del módulo: ' + module);
    }
  });

  //3.- Load Models
  _modules.forEach(function(module) {
    if(unuko.modules[module]) {
      if(unuko.modules[module].loadModels) {
        unuko.modules[module].loadModels();
      } else {
        console.log('Error en carga del modelo del módulo: ' + module);
      }
    } else {
      console.log('Error en la carga del módulo: ' + module);
    }
  });

  //console.log('unuko.registerPartial', unuko.registerPartial);
  //4.- Register component
  _modules.forEach(function(module) {
    if(unuko.modules[module]) {
      if(unuko.modules[module].registerModule) {
        unuko.modules[module].registerModule();
      } else {
        console.log('Error en el registro del módulo: ' + module);
      }
    } else {
      console.log('Error en la carga del módulo: ' + module);
    }
  });

  //5.- Initialize mw
  _modules.forEach(function(module) {
    if(unuko.modules[module]) {
      if(unuko.modules[module].initializeMiddelware) {
        unuko.modules[module].initializeMiddelware();
      } else {
        console.log('Error en el initializeMiddelware del módulo: ' + module);
      }
    } else {
      console.log('Error en la initializeMiddelware del módulo: ' + module);
    }
  });


  //6.- Initialize routes
  _modules.forEach(function(module) {
    if(unuko.modules[module]) {
      if(unuko.modules[module].initializeRoute) {
        unuko.modules[module].initializeRoute();
      } else {
        console.log('Error en el initializeRoute del módulo: ' + module);
      }
    } else {
      console.log('Error en la initializeRoute del módulo: ' + module);
    }
  });




  console.log('------------');
  console.log('Fin de carga');












  unuko.createPage = function(page) {
    var html = {};
    html.title = page.title;
    html.header = page.header;
    html.layout = [];
    return html;
  }

  unuko.addBlock = function(html, block) {
    var _block = {
      name: block.name,
      content: block.content,
      layout: []
    };
    if(block.template) {
      _block.template = unuko.compiles[block.template];
    } else {
      _block.template = unuko.compiles.EOT;
    }
    html.layout.push(_block);
    return _block;
  }

  unuko.render = function(html) {
    console.time('render');
    var source = '<!-- Render generator -->\n';
    source += '{{>html}}\n';
    source += '<!-- /Render generator -->\n'
    var template = hbs.compile(source);
    var result = template(html);
    console.timeEnd('render');
    return result;
  }
}


module.exports = unuko;
