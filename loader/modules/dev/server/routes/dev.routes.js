'use strict';

//var devPolicy = require('../policies/dev.policy');
var devController = require('../controllers/dev.controller');

module.exports = function (app) {

	app.route('/')
	.get(devController.demo);

	app.route('/dev')
	//.all(devPolicy.isAllowed)
	.get(devController.list)
	//.post(devController.create);

	app.route('/dev/:devId')
	//.all(devPolicy.isAllowed)
    //.get(devController.read)
    //.put(devController.update)
    //.delete(articles.delete);

	//app.param('devId', devController.devId);
}