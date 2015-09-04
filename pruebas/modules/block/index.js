module.exports = function(unuko) {

  var _module = {};
  _module.info = {
    name: 'block',
    description: 'Block System',
    required: true
  };

  unuko.blocks = {};


  _module.initialize = function() {
  	console.log('+++iniciado modulo');
 	unuko.modules.layout.registerPartial(__dirname + '/templates/', 'demo');
  }

  //Refactorizo res para añadir setContent
  //res.setContent = function(content) {
  	_module.setBlock= function(res, pos, template) {
    var _container = res.locals.html.layout.filter(function(element) {
      return element.name === res.locals.html.col[pos].container;
    })[0];
    var _row = _container.layout.filter(function(element) {
      return element.name === res.locals.html.col['sidebar'].row;
    })[0];
    var _col = _row.layout.filter(function(element) {
      return element.name === pos;
    })[0];
    _col.layout.push({
    	template: unuko.compiles[template]
    })
  }



  _module.initializeMiddleware = function() {
  	console.log('+++initializeMiddleware');



  	unuko.app.use(function(req, res, next) {
  		console.log('+++initializeMiddleware');
  		res.locals.block = res.locals.block || {};
  		res.locals.block.demo = {
  			name: 'Nombre del bloque',
  			items: [1,2,3]
  		}
  		_module.setBlock(res, 'sidebar', 'demo');
  		next();
  	});
  }

  _module.registerBlock = function(name, title, content, layout) {
  unuko.blocks[name] = {
    name:  name,
    title: title,
    content: content,
    template: 'block',
    layout: layout ? [layout] : []
  }
}

  return _module;
}