var glob = require('glob');
var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var mongoose = require('mongoose');
var express = require('express');

var _modules = {
	models: 		['modules/*/server/models/**/*.js'],
	routes: 		['modules/*/server/routes/**/*.js'],
	config: 		['modules/*/server/config/*.js'],
	views: 			['modules/*/server/views/*.html'],
	prueba : 		'prueba/*'
};

var unuko = {};
unuko.app = express();


var getPaths = function (pattern) {
  var urlRegex = new RegExp('^(?:[a-z]+:)?\/\/', 'i');
  var output = [];
  if (_.isArray(pattern)) {
    pattern.forEach(function (pattern) {
      output = _.union(output, getPaths(pattern));
    });
  } else if (_.isString(pattern)) {
    if (urlRegex.test(pattern)) {
      output.push(pattern);
    } else {
      var files = glob.sync(pattern);
      output = _.union(output, files);
    }
  }
  return output;
};



var loadModels = function () {
	var files = getPaths(__dirname + '/' + _modules.models);
	files.forEach(function(p) {
		console.log('proceso: ' + p);
		require(p);
	});
}

var loadRoutes = function (app) {
	var files = getPaths(__dirname + '/' + _modules.routes);
	files.forEach(function(p) {
		console.log('proceso: ' + p);
		require(p)(app);
	});
}

loadModels();
loadRoutes(unuko.app);

console.log(mongoose.models)

unuko.app.listen(3000);