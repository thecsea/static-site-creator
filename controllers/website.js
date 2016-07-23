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
 * GET /websites/all
 */
exports.websitesGet = function(req, res) {
  req.user.related('websites').fetch().then((websites) => {
    res.send({websites: websites.toJSON()});
  });
};

/**
 * POST /websites
 */
exports.websitesPost = function(req, res) {

};

/**
 * PUT /websites
 */
exports.websitesPut = function(req, res) {

};


/**
 * DELETE /websites
 */
exports.websitesDelete = function(req, res) {

};
