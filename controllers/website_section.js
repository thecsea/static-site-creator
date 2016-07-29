var Website = require('../models/Website');
var WebsiteSection = require('../models/WebsiteSection');
var Template = require('../models/Template');
var currentWebsite = null;
var currentWebsiteSection = null;

/**
 * Login required middleware
 * this checks also if the website exists
 */
exports.ensureAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) {
    new Website({id: req.params.websiteId}).fetch({withRelated: ['sections','sections.template']}).then((website)=>{
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

exports.getCurrentSection = function(req, res, next) {
  if (req.isAuthenticated()) {
    new WebsiteSection({id: req.params.id}).fetch({withRelated: ['website','template']}).then((section)=>{
      if(section.related('website').get('user_id') == req.user.id) {
        currentWebsiteSection = section;
        next();
      }else
        res.status(403).send({ msg: 'Forbidden' });
    }).catch(()=>{
      res.status(404).send({ msg: 'Wrong website section id' });
    });
  } else {
    res.status(401).send({ msg: 'Unauthorized' });
  }
};

exports.ensureAdmin = function(req, res, next) {
  if (req.isAuthenticated() && !req.user.get('editor')) {
    next();
  } else {
    res.status(401).send({ msg: 'Unauthorized' });
  }
};

/**
 * GET /websites/:id/sections/all
 */
exports.websiteSectionsGet = function(req, res) {
  res.send({website: currentWebsite.toJSON()});
};

/**
 * GET /websites/:id/sections/:id/get
 */
exports.websiteSectionGet = function(req, res) {
    res.send({websiteSection: currentWebsiteSection.toJSON()});
};

/**
 * POST /websites/:id/sections
 */
exports.websiteSectionsPost = function(req, res) {
  req.assert('name', 'Name cannot be blank').notEmpty();
  req.assert('path', 'Url cannot be blank').notEmpty();
  req.assert('template_id', 'template_id cannot be blank and it must be a valid id').notEmpty().isInt();

  var errors = req.validationErrors();

  if (errors) {
    return res.status(422).send(errors);
  }

  new Template({id: req.body.template_id}).fetch().then((template)=>{
    if(template.get('user_id') !== req.user.id)
      return res.status(403).send({ msg: 'The template inserted is not yours' });
    currentWebsite.sections().create({
      name: req.body.name,
      path: req.body.path,
      template_id: req.body.template_id
    }).then(function(section) {
      res.send({ websiteSection: section.toJSON() });
    }).catch(function(err) {
      if (err.code === 'ER_DUP_ENTRY'  || err.code === 'SQLITE_CONSTRAINT') {
        return res.status(422).send({ msg: 'A section with the same path for this website was already used' }); //path + website unique
      }else {
        console.log(err);
        return res.status(500).send({ msg: 'Error during creation of the website section' });
      }
    });
  }).catch((err)=>{
    console.log(err);
    return res.status(500).send({ msg: 'Wrong template id' });
  })
};

/**
 * PUT /websites/:id/sections
 */
exports.websiteSectionsPut = function(req, res) {
  req.assert('name', 'Name cannot be blank').notEmpty();
  req.assert('path', 'Url cannot be blank').notEmpty();
  req.assert('template_id', 'template_id cannot be blank and it must be a valid id').notEmpty().isInt();

  var errors = req.validationErrors();

  if (errors) {
    return res.status(422).send(errors);
  }

  new Template({id: req.body.template_id}).fetch().then((template)=>{
    if(template.get('user_id') !== req.user.id)
      return res.status(403).send({ msg: 'The template inserted is not yours' });
    currentWebsiteSection.save({
      name: req.body.name,
      path: req.body.path,
      template_id: req.body.template_id
    }).then(function(section) {
      res.send({ websiteSection: section.toJSON() });
    }).catch(function(err) {
      if (err.code === 'ER_DUP_ENTRY'  || err.code === 'SQLITE_CONSTRAINT') {
        return res.status(422).send({ msg: 'A section with the same path for this website was already used' }); //path + website unique
      }else {
        console.log(err);
        return res.status(500).send({ msg: 'Error during updating of the website section' });
      }
    });
  }).catch((err)=>{
    console.log(err);
    return res.status(500).send({ msg: 'Wrong template id' });
  })
};


/**
 * DELETE /websites/:id/sections
 */
exports.websiteSectionsDelete = function(req, res) {
  currentWebsiteSection.destroy().then(function(section) {
    res.send({ websiteSection: section.toJSON() });
  }).catch(function(err) {
    console.log(err);
    return res.status(500).send({ msg: 'Error during deleting of the website' });
  });
};
