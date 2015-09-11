'use strict';

var path = require('path');
var mongoose = require('mongoose');
var Dev = mongoose.model('Dev');


/**
 * List of Articles
 */
exports.list = function (req, res) {
  Dev.find()
  .sort('-created')
  .populate('user', 'displayName')
  .exec(function (err, dev) {
    if (err) {
      return res.status(400).send({
        //message: errorHandler.getErrorMessage(err)
        message: 'error'
      });
    } else {
      res.json(dev);
    }
  });
};


exports.demo = function(req, res) {
	res.send('demo');
}