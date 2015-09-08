exports.fieldType = function() {
	var _module = {};
	var _fieldTypes = {};

	_module.add = function(obj) {
		_fieldTypes[obj.name] = {
			name: obj.name,
			title: obj.title,
			helperView: obj.helperView,
			helperEdit: obj.helperEdit,
			validators: obj.validators
		}
		return _fieldTypes[obj.name];
	}
	_module.get = function(name) {
		return _fieldTypes[name];
	}
	return _module;
}

exports.fields = function(fieldType) {
	var _module = {};
	var _fields = {};

	_module.add = function(obj) {
		_fields[obj.name] = {
			name: obj.name,
			type: obj.type,
			validators: obj.validators
		}
		return _fields[obj.name];
	}

	_module.get = function(name) {
		return _fields[name];
	}
	return _module;
}

exports.entityType = function() {
	var _entityTypes = {};
	var _module = {};

	_module.add = function(obj) {
		_entityTypes[obj.name] = {
			name: obj.name,
			fields: {},
			addField: function(obj) {
				this.fields[obj.name] = {
					name: obj.name,
					field: obj.field
				}
			}
		};
		return _entityTypes[obj.name];
	}

  _module.all = function() {
    return _entityTypes;
  }

  _module.get = function(name) {
    return _entityTypes[name];
  }

	return _module;
}

exports.entity = function() {
	var _entity =  {};
	var _module = {};

	_entity.renderEdit = function() {
		console.log('Renderizando edit...');
		for(var field in _entity.entityType.fields) {
			var _field = _entity.entityType.fields[field];
			console.log('------------');
			console.log('label', _field);
			console.log(_field.field.type.helperEdit(_field));
		}
	}

	_module.new = function(entityType, obj) {
		console.log('nuevo');
		_entity.entityType = entityType;
		return _entity;
	}

	_module.add = function(entityType, obj) {
		_entity = {
			name: obj.name,
			fields: {}
		}
		_errors = {};
		var _valid = true;
		for(var field in entityType.fields) {
			var _validators = entityType.fields[field].field.type.validators;
			for(var validator in  _validators) {
				if(!obj.fields[field]) {
					obj.fields[field] = '';
				}
				var v = _validators[validator].validator(entityType.fields[field].field.validators[validator], obj.fields[field]);
				if(!v) {
					_valid = false;
					if(!_errors[field]) {
						_errors[field] = [];
					}
					_errors[field].push(validator);
				}
			}
			_entity.fields[field] = obj.fields[field];
		}
		//Si la validación ha sido correcta, se crea la entidad

		if(_valid) {
			return {valid: true, entity: _entity};
		} else {
			return {valid: false, errors: _errors};
		}


	}

	return _module;
}
