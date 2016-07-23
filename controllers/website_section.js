var Website = require('../models/Website');
var currentWebsite = null;

/**
 * Login required middleware
 * this checks also if the website exists
 */
exports.ensureAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) {
    new Website({id: req.params.id}).fetch().then((website)=>{
      if(website.get('user_id') == req.user.id) {
        currentWebsite = website;
        next();
      }else
        res.status(403).send({ msg: 'Forbidden' });
    }).catch(()=>{
      res.status(404).send({ msg: 'Wrong website id' });
    });
  } else {
    res.status(401).send({ msg: 'Unauthorized' });
  }
};

//TODO check if website and template choosen are of the current user

//TODO check id in put and delete with a middleware

/**
 * GET /websites/:id/sections/all
 */
exports.websiteSectionsGet = function(req, res) {
  currentWebsite.related('sections').fetch({withRelated: ['website', 'template']}).then((sections) => {
    res.send({websiteSections: sections.toJSON()});
  });
};

/**
 * POST /websites/:id/sections
 */
exports.websiteSectionsPost = function(req, res) {

};

/**
 * PUT /websites/:id/sections
 */
exports.websiteSectionsPut = function(req, res) {

};


/**
 * DELETE /websites/:id/sections
 */
exports.websiteSectionsDelete = function(req, res) {

};
