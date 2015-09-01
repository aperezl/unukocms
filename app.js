var hbs = require('hbs');
var fs = require('fs');
var express = require('express');
var app = express();

console.log();
var t = fs.readFileSync(__dirname + '/text.txt', 'utf8');

var partials = {};
var compiles = {}
var templates = ['html', 'page', 'sidebar', 'about', 'login'];

partials.EOT = hbs.registerPartial('EOT', '');
compiles.EOT = hbs.compile('EOT');

templates.forEach(function(v) {
  partials[v] = hbs.registerPartial(v, fs.readFileSync(__dirname + '/templates/' + v + '.hbs', 'utf8'));
  compiles[v] = hbs.compile(v);
  console.log('-->Cargado ' + v);
});
console.log('Terminada carga de partials');

var layout = {
  title: 'Título de la página',
  header: 'Nombre de la cabecera',
  layout: [
    {
      name: 'soy Sidebar',
      content: '...',
      class: ['sidebar', 'bbb'],
      layout: [
        {
          template: compiles.sidebar,
          data: 'lll'
        }
      ],
      order: 2
    },
    {
      name: 'aquí va el content',
      content: '...',
      //sub: compiles.EOT,
      order: 1
    },
    {
      name: 'Cabecera',
      content: 'jsalkdjfaskdl',
      //sub: compiles.EOT,
      order: 0
    }
  ]
}


var createPage = function(page) {
  var html = {};
  html.title = page.title;
  html.header = page.header;
  html.layout = [];
  return html;
}
var addBlock = function(html, block) {
  var _block = {
    name: block.name,
    content: block.content,
    layout: []
  };
  if(block.template) {
    _block.template = compiles[block.template];
  } else {
    _block.template.EOT;
  }
  html.layout.push(_block);
  return _block;
}

var html = createPage({
  title: 'Soy el título',
  header: 'Soy la cabecera'
});


var sidebar = addBlock(html, {
  name: 'sidebar',
  content: '...',
  template: 'page'
});


addBlock(sidebar, {
  name: 'hola',
  content: 'otro más',
  template: 'sidebar'
})
addBlock(sidebar, {
  name: 'hola2',
  content: 'adfas',
  template: 'sidebar'
});

addBlock(sidebar, {
  name: 'probando',
  content: 'asdsa',
  template: 'about'
});

addBlock(sidebar, {
  name: 'login',
  content: '',
  template: 'login'
})


console.log(html)





//Proceso para arreglar el array.
layout.layout.map(function(v) {
  if(v.class) {
    v.class = v.class.join(' ');
  }

  //Ordenar el elemento
});

var source = '<!-- Render generator -->\n';
source += '{{>html}}\n';
source += '<!-- /Render generator -->\n'
var template = hbs.compile(source);
var result = template(html);
console.log(result);








/*
hbs.registerPartial('p1', '>>>{{name}}-{{description}}-{{data}}<<<');
hbs.registerPartial('p2', '[[[{{data.uno}}--{{data.dos}}]]]');
var source = '{{#each kk}}-{{name}}-{{/each}}--{{#each par}}-{{>(name)}}-{{/each}}-{{data.p1.name}}';
var template = hbs.compile(source);

var p1 = hbs.compile('p1');
var p2 = hbs.compile('p2');
var context = {
  kk: [
    {
      name: 'uno'
    },
    {
      name: 'dos'
    },
    {
      name: 'tres'
    }
  ],
  par: [
    {
      name: p1,
      description: 'lll',
      data: 'bb'
    },
    {
      name: p1,
      description: 'Soy otro módulo',
      data: 'Datos para otro módulo'
    },
    {
      name: p2,
      data: {
        uno: 'Si funciona, vamos por buen camino',
        dos: 'Y parece que si'
      }
    }
  ],
  data: {
    p1: {
      name: 'adios'
    }
  }
}
var result = template(context);

console.log(result);
*/

app.get('/', function(req, res) {
  res.send(result)
});

app.listen(3000);
