var Website = require('../models/Website');
var WebsiteSection = require('../models/WebsiteSection');
var Template = require('../models/Template');

/**
 * Login required middleware
 * this checks also if the website exists
 */
exports.ensureAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) {
    new Website({id: req.params.websiteId}).fetch({withRelated: ['sections','sections.template', 'editors']}).then((website)=>{
      if(req.user.get('editor')){
        if (pluck(website.related('editors'),'id').indexOf(req.user.id) != -1) {
          req.currentWebsite = website;
          next();
        } else
          res.status(403).send({msg: 'Forbidden'});
      }else {
        if (website.get('user_id') == req.user.id) {
          req.currentWebsite = website;
          next();
        } else
          res.status(403).send({msg: 'Forbidden'});
      }
    }).catch(()=>{
      res.status(404).send({ msg: 'Wrong website id' });
    });
  } else {
    res.status(401).send({ msg: 'Unauthorized' });
  }
};

exports.getCurrentSection = function(req, res, next) {
  if (req.isAuthenticated()) {
    new WebsiteSection({id: req.params.id}).fetch({withRelated: ['website', 'website.editors','template']}).then((section)=>{
      if(req.user.get('editor')){
        if (pluck(section.related('website').related('editors'),'id').indexOf(req.user.id) != -1) {
          req.currentWebsiteSection = section;
          next();
        } else
          res.status(403).send({msg: 'Forbidden'});
      }else {
        if (section.related('website').get('user_id') == req.user.id) {
          req.currentWebsiteSection = section;
          next();
        } else
          res.status(403).send({msg: 'Forbidden'});
      }
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
  var currentWebsite = req.currentWebsite.toJSON()
  if(req.user.get('editor'))
    delete currentWebsite.editors;
  res.send({website: currentWebsite});
};

/**
 * GET /websites/:id/sections/:id/get
 */
exports.websiteSectionGet = function(req, res) {
  var currentWebsiteSection = req.currentWebsiteSection.toJSON();
  if(req.user.get('editor'))
    delete currentWebsiteSection.website.editors;
  res.send({websiteSection: currentWebsiteSection});
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
    req.currentWebsite.sections().create({
      name: req.body.name,
      path: req.body.path,
      template_id: req.body.template_id
    }).then(function(section) {
      res.send({ websiteSection: section.toJSON() });
    }).catch(function(err) {
      if (err.code === 'ER_DUP_ENTRY'  || err.code === 'SQLITE_CONSTRAINT' || err.code == '23505') {
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
    req.currentWebsiteSection.save({
      name: req.body.name,
      path: req.body.path,
      template_id: req.body.template_id
    }).then(function(section) {
      res.send({ websiteSection: section.toJSON() });
    }).catch(function(err) {
      if (err.code === 'ER_DUP_ENTRY'  || err.code === 'SQLITE_CONSTRAINT' || err.code == '23505') {
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
  req.currentWebsiteSection.destroy().then(function(section) {
    res.send({ websiteSection: section.toJSON() });
  }).catch(function(err) {
    console.log(err);
    return res.status(500).send({ msg: 'Error during deleting of the website' });
  });
};

function pluck(data, key){
  return data.map((value)=>{return value[key];});
}