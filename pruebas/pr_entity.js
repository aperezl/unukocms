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


//console.log(et1);
//3.- Create a entity
var e2 = e.new(et1);

e2.renderEdit();

var e1 = e.add(et1, {
	name: 'post1',
	fields: {
		body: 'body1 adfasdfasd asdf df',
		price: 8,
		nombre: 'Antonio',
		apellidos: 'Pérez López'
	}
});


//console.log(e1);