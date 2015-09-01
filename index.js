var unuko = require('./core');

unuko.init();


  /*
  res.html.layout['main'].layout['main'].layout['sidebar'].layout['about'].data = {
    about: '<p>Aquí se coloca el about del documento</p>'
  }
  */


  //Tengo que hacer el load User en este punto:
  //Middleware para cargar el usuario en cada petición





//Colocando bloques: TODO: Automatizar esta parte en el módulo blocks
/*
unuko.html.layout['main'].layout['main'].layout['sidebar'].layout['login'] = unuko.blocks['login'];
unuko.html.layout['main'].layout['main'].layout['sidebar'].layout['about'] = unuko.blocks['about'];
unuko.html.layout['main'].layout['main'].layout['sidebar'].layout['userinfo'] = unuko.blocks['userinfo'];
unuko.html.layout['main'].layout['main'].layout['content'].layout['breadcrumb'] = unuko.blocks['breadcrumb'];
unuko.html.layout['header'].layout['header2'].layout['logo'].layout['mainmenu'] = unuko.blocks['mainmenu'];
unuko.html.layout['header'].layout['header1'].layout['logo'].layout['logo'] = unuko.blocks['logo'];
unuko.html.layout['footer'].layout['footer'].layout['footer'].layout['copyright'] = unuko.blocks['copyright'];
*/





unuko.app.get('/', function(req, res) {
  //redefinimos para probar el contenido de una col
  var text = '<h1>Página de inicio</h1>';
  text += '<p>Bienvenido a la página de presentación</p>';
  text += '<p>Se debería generar código tanto como layout, como añadiendo templates</p>';
  text += '<p><a href="/demo">Ir a demo</a></p>';
  res.html.layout['main'].layout['main'].layout['content'].content = text;
  //res.send(res.html);
  /*
  res.html.layout['main'].layout['main'].layout['sidebar'].layout['login'].data = {
    username: 'admin'
  }
  */
  res.send(unuko.render(res.html));
});

//404

unuko.app.get('/:alias', function(req, res, next) {
  console.log('buscando alias');
  unuko.models.Entity.findOne({alias: req.params.alias}, function(err, entity) {
    if(err) console.log(err);
    if(entity) {
      console.log(entity);
      console.log('---Debo procesar el alias---');
      console.log(unuko.menu['/entity/:entityId']);
      req.entity = entity;
      unuko.menu['/entity/:entityId'].callback(req, res);
    } else {
      next();
    }
  });
});

unuko.app.get('*', function(req, res) {
  console.log('Encontrado error 404');
  res.setContent('<h1>404: Página no encontrada</h1>');
  res.send(unuko.render(res.html));
});

unuko.app.listen(3000);

//unuko.render(html);
