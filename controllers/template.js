var User = require('../models/User');

/**
 * Login required middleware
 */
exports.ensureAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(401).send({ msg: 'Unauthorized' });
  }
};

/**
 * GET /templates/all
 */
exports.templatesGet = function(req, res) {
  req.user.related('templates').fetch().then((templates) => {
    res.send({templates: templates.toJSON()});
  });
};

/**
 * POST /templates
 */
exports.templatesPost = function(req, res) {

};

/**
 * PUT /templates
 */
exports.templatesPut = function(req, res) {

};


/**
 * DELETE /templates
 */
exports.templatesDelete = function(req, res) {

};
