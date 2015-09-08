//Definición de las entidades.
//Todo el contenido dinámico existente en el sitio se gestionará a través de entidades.
//En una primera aproximanción generaremos entidades básicas asociadas a un usuario.

module.exports = function(unuko) {
  var _module = {};
  _module.info = {
    name: 'entity',
    description: 'Entity System',
    required: true
  };


  module.initialize = function() {
    //Definición de fields de ejemplo:
    unuko.fields = {
      subtitle: {
        name: 'subtitle',
        title: 'Entradilla',
        type: 'text'
      },
      body: {
        name: 'body',
        title: 'Cuerpo',
        type: 'textarea'
      },
      category: {
        name: 'category',
        title: 'Categoría',
        type: 'text'
      },
      status: {
        name: 'status',
        title: 'Estado',
        type: 'select',
        options: {
          0: 'Borrador',
          1: 'Publicado'
        }
      }
    };

    //Register partials
    unuko.modules.layout.registerPartial(__dirname + '/templates/', 'tabs');
    unuko.modules.layout.registerPartial(__dirname + '/templates/', 'entity.list');
    unuko.modules.layout.registerPartial(__dirname + '/templates/', 'entity.show');
    unuko.modules.layout.registerPartial(__dirname + '/templates/', 'entity.edit');

    unuko.modules.layout.registerHelper('ifvalue', function(conditional, options) {
      if(conditional && options.hash.value && options.hash.value.toString() == conditional.toString()) {
        return options.fn(this);
      } else {
        return options.inverse(this);
      }
    });


    //Helpers
    unuko.modules.layout.registerHelper('fields', function(items, options) {
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

    unuko.modules.layout.registerHelper('fieldsEdit', function(items, options) {
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


    unuko.modules.menu.add('admin', {
      name: 'entity',
      title: 'Entity List',
      path: '/entity',
      parent: 'home',
      method: 'get',
      callback: function(req, res){
        unuko.models.Entity.find({}, function(err, entities) {
          if(err) console.log(err);
          res.setTemplate({
            template: unuko.compiles['entity.list'],
            data: {
              entities: entities
            }
          });
          res.render('layout');
        });
      },
      visible: true,
			//access_callback: unuko.modules.user.hasPermission,
      //access_params: 'view roles',
    });

    unuko.modules.menu.add('admin', {
      name: 'entity.edit',
      title: 'Entity Edit',
      path: '/entity/edit/:entityId',
      parent: 'entity',
      callback: function(req, res) {


        unuko.models.Entity.findOne({_id: req.params.entityId}, function(err, entity) {
          if(err) console.log(err);
          unuko.models.Entity.find({index: true}, function(err, entitiesIndex) {
            console.log(entitiesIndex);
            res.setTemplate({
              template: unuko.compiles['entity.edit'],
              data: {
                fields: unuko.fields,
                entity: entity,
                entitiesIndex: entitiesIndex
              }
            });
            res.render('layout');
          });
        });
      },
      visible: true
    })

  }



  //Definir schemas.
  var entitySchema = new unuko.Schema({
    title: {type: String, required: true},
    _userId: {type: unuko.Schema.Types.ObjectId, ref: 'User'},
    created: {type: Date, default: Date.now },
    status: {type: String},
    index: {type: Boolean},
    _parent: {type: unuko.Schema.Types.ObjectId, ref: 'Entity'},
    roles: [],
    hasalias: {type: Boolean},
    alias: {type: String},
    fields: unuko.Schema.Types.Mixed
  });



  unuko.models.Entity = unuko.mongoose.model('Entity', entitySchema);

  module.registerModule = function() {
    unuko.registerPartial(__dirname + '/templates/', 'entity.new');
    unuko.registerPartial(__dirname + '/templates/', 'entity.list');
    unuko.registerPartial(__dirname + '/templates/', 'entity.show');
    unuko.registerPartial(__dirname + '/templates/', 'entity.edit');
    unuko.registerPartial(__dirname + '/templates/', 'tabs');

    unuko.registerPermission('new entity');
    unuko.registerPermission('edit entity');
    unuko.registerPermission('view entity');

    unuko.registerBlock('breadcrumb', 'breadcrumb', '', {
      name: 'breadcrumb',
      title: 'breadcrumb',
      template: 'breadcrumb',
      data: 'data de prueba'
    });
  }

  unuko.app.param('entityId', function(req, res, next, entityId) {
    unuko.models.Entity.findOne({_id: entityId}, function(err, entity) {
      if(err) console.log(err);
      req.entity = entity;
      next();
    })
  });



  module.initializeRoute = function() {

    unuko.app.get('/entity/new', function(req, res) {

      var entity = new unuko.models.Entity();
      entity.fields = {};
      res.setTemplate({
        template: unuko.compiles['entity.new'],
        data: {
          fields: unuko.fields,
          entity: entity
        }
      });
      res.send(unuko.render(res.html));
    });

    unuko.path({
      name: 'entity',
      title: 'entity',
      url: '/entity',
      method: 'get',
      callback: function(req, res){
        unuko.models.Entity.find({}, function(err, entities) {
          if(err) console.log(err);
          res.setTemplate({
            title: 'entity.list',
            name: 'entity.list',
            template: unuko.compiles['entity.list'],
            data: {
              entities: entities
            }
          });
          res.send(unuko.render(res.html));
        });
      },
      access_callback: unuko.hasPermission,
      access_params: 'edit entity'
    });

    unuko.path({
      name: 'entity_show',
      title: 'soy titulo',
      callback_path: function() {
        return function(req, res) {
          return {
            url: '/entity/' + req.entity._id,
            title: req.entity.title
          };
        }
      },
      abc: function() {return 'abc'},
      url: '/entity/:entityId',
      method: 'get',
      parent: '/entity',

      callback: function(req, res) {
          console.log('--Comprobamos la llamada desde la redirección');
          console.log(req.entity);
          res.setTemplate({
            title: 'entity.list',
            name: 'entity.list',
            template: unuko.compiles['entity.show'],
            data: {
              entity: req.entity,
              fields: unuko.fields
            }
          });
          console.log('--Creado template')
          res.send(unuko.render(res.html));
      },
      access_callback: unuko.hasPermission,
      access_params: 'view entity'
    });

    unuko.path({
      name: 'entity_edit',
      title: 'Edit',
      callback_path: function() {
        return function(req, res) {
          return {
            url: '/entity/edit/' + req.entity._id,
            title: 'Edit'
          };
        }
      },
      url: '/entity/edit/:entityId',
      method: 'get',
      parent: '/entity/:entityId',
      callback: function(req, res) {
        unuko.models.Entity.findOne({_id: req.params.entityId}, function(err, entity) {
          if(err) console.log(err);
          unuko.models.Entity.find({index: true}, function(err, entitiesIndex) {
            console.log(entitiesIndex);
            res.setTemplate({
              template: unuko.compiles['entity.edit'],
              data: {
                fields: unuko.fields,
                entity: entity,
                entitiesIndex: entitiesIndex
              }
            });
            res.send(unuko.render(res.html));
          });
        });
      },
      access_callback: unuko.hasPermission,
      access_params: 'edit entity'
    });

    /*

    unuko.app.get('/entity/edit/:entityId', function(req, res) {
      if(!unuko.hasPermission(req.user, 'edit entity')) {
        res.redirect('/users/login');
      } else {
        unuko.models.Entity.findOne({_id: req.params.entityId}, function(err, entity) {
          if(err) console.log(err);
          res.setTemplate({
            template: unuko.compiles['entity.edit'],
            data: {
              fields: fields,
              entity: entity
            }
          });
          res.send(unuko.render(res.html));
        });
      }
    });
    */

    unuko.app.put('/entity/:entityId', function(req, res) {
      unuko.models.Entity.findOne({_id: req.params.entityId}, function(err, entity) {
        if(err) console.log(err);
        entity.title = req.body.title;
        entity.status = req.body.status;
        if(req.body.parent !== "") {
          console.log('algo hay')
          entity._parent = req.body.parent
        } else {
          entity._parent = null;
        }

        req.body.index ? entity.index = true : entity.index = false;
        req.body.hasalias ? entity.hasalias = true : entity.hasalias = false;
        entity.alias = req.body.alias;


        entity.index = req.body.index;
        entity.fields = req.body.fields;
        entity.save(function(err, entity) {
          if(err) console.log(err);
          //res.send(entity);
          res.redirect('/entity/' + req.params.entityId);
        })
      })
    });

    unuko.app.post('/entity', function(req, res) {
      var entity = new unuko.models.Entity();
      entity.title = req.body.title;
      entity.fields = req.body.fields;
      entity.save(function(err, entity) {
        if(err) console.log(err);
        res.redirect('/entity');
      });
    });

  }

  return module;

}
