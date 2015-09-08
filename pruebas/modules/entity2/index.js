var entity = require('./entity.js');

var ft = entity.fieldType();
var f = entity.fields();
var et = entity.entityType();
var e = entity.entity();


var fieldTypeText = ft.add({
	name: 'text',
	title: 'text',
	type: 'text',
	helperEdit: function(field) {
		return '<input type=""text" name="' + field.name + '">';
	},
	helperView: function() {
		return '...'
	},
	validators: {
		maxLength: {
			title: 'Max Length',
			validator: function(config, value) {
				return (value.length <= config);
			}
		},
		minLength: {
			title: 'Min Length',
			validator: function(config, value) {
				return (value.length >= config);
			}
		},
		required: {
			title: 'Required',
			validator: function(config, value) {
				return true
			}
		}
	}
});

var fieldTypeNumeric = ft.add({
	name: 'numeric',
	title: 'numeric',
	helperView: function() {
		console.log('field..')
	},
	helperEdit: function() {
		return '<input type=""numeric">';
	},
	validators: {
		max: {
			title: 'Max Length',
			validator: function(config, value) {
				return (value <= config);
			}
		},
		min: {
			title: 'Min Length',
			validator: function(config, value) {
				return (value >= config);
			}
		},
		required: {
			title: 'Required',
			validator: function(config, value) {
				return true
			}
		},
		numeric: {
			title: 'Numeric',
			validator: function(config, value) {
				 return (value - 0) == value && (''+value).trim().length > 0;
			}
		}
	}
});

var fieldBody = f.add({
	name: 'text',
	type: fieldTypeText,
	validators: {
		maxLength: 255,
		minLength: 2,
		required: false,
		numeric: false
	}
});

var fieldNombre = f.add({
	name: 'text',
	type: fieldTypeText,
	validators: {
		maxLength: 10,
		minLength: 2,
		required: false,
		numeric: false
	}
});

var fieldApellidos = f.add({
	name: 'text',
	type: fieldTypeText,
	validators: {
		maxLength: 255,
		minLength: 2,
		required: false,
		numeric: false
	}
});

var fieldPrice = f.add({
	type: fieldTypeNumeric,
	validators: {
		max: 10,
		min: 2,
		required: false,
		numeric: false
	}
});


//1.- Create Entity Type
var et1 = et.add({name: 'post'});

//2.- Add Fields to a Entity Type
et1.addField({name: 'body', field: fieldBody});
et1.addField({name: 'price', field: fieldPrice});
et1.addField({name: 'nombre', field: fieldNombre});
et1.addField({name: 'apellidos', field: fieldApellidos});


module.exports = function(unuko) {
  var _module = {};
  _module.info = {
    name: 'Entity',
    description: 'Entity System',
    required: true
  };


  _module.initialize = function() {
    unuko.modules.layout.registerPartial(__dirname + '/templates/', 'entity-type.list');
    unuko.modules.layout.registerPartial(__dirname + '/templates/', 'entity-type.edit');
    unuko.modules.layout.registerPartial(__dirname + '/templates/', 'entity-type.edit.field');

    unuko.modules.menu.add('admin', {
      title: 'Enity2',
      name: 'entity2',
      parent: 'home',
      path: '/entity2',
      callback: function(req, res) {
        console.log(et.all());
        var menu = unuko.modules.menu.get('admin', 'entity2');
        res.setTemplate({
          template: unuko.compiles['entity-type.list'],
          data: {
            entityTypes: et.all()
          }
        });
        //res.send(_module.render(res.html));
        res.render('layout');
      },
      visible: true
    });

    unuko.modules.menu.add('admin', {
      title: 'Entity2.Edit',
      name: 'entitytype.edit',
      parent: 'entity2',
      path: '/entity2/:entityType',
      callback: function(req, res) {
        console.log(et.get(req.params.entityType));
        res.setTemplate({
          template: unuko.compiles['entity-type.edit'],
          data: {
            entityType: et.get(req.params.entityType)
          }
        });
        //res.send(et.get('post'));
        res.render('layout');
      }
    });

    unuko.modules.menu.add('admin', {
      title: 'Entity2.edit.field',
      name: 'entitytype.edit.field',
      parent: 'entitytype.edit',
      path: '/entity2/:entityType/:field',
      callback: function(req, res) {
        res.setTemplate({
          template: unuko.compiles['entity-type.edit.field'],
          data: {
            field: et.get('post').fields[req.params.field].field
          }
        });
        //res.send(et.get('post').fields[req.params.field].field)
        res.render('layout');
      }
    })

  }





  return _module;
}
