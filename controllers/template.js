var User = require('../models/User');
var Template = require('../models/Template');

/**
 * Login required middleware
 */
exports.ensureAuthenticated = function(req, res, next) {
  if (req.isAuthenticated() && !req.user.get('editor')) {
    next();
  } else {
    res.status(401).send({ msg: 'Unauthorized' });
  }
};

exports.ensureMine = function(req, res, next) {
  if (req.isAuthenticated() && !req.user.get('editor')) {
    new Template({id: req.params.id}).fetch().then((template)=>{
      if(template.get('user_id') == req.user.id) {
        req.currentTemplate = template;
        next();
      }else
        res.status(403).send({ msg: 'Forbidden' });
    }).catch(()=>{
      res.status(404).send({ msg: 'Wrong template id' });
    });
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
  }).catch((e)=>{
    console.log(e);
    return res.status(500).send({msg: 'Error during fetching templates'});
  });;
};

/**
 * POST /templates
 */
exports.templatesPost = function(req, res) {
  req.assert('name', 'Name cannot be blank').notEmpty();
  req.assert('parsedStructure', 'Structure cannot be blank').notEmpty();

  var errors = req.validationErrors();

  if (errors) {
    return res.status(422).send(errors);
  }

  req.user.templates().create({
    name: req.body.name,
    parsedStructure: req.body.parsedStructure
  }).then(function(template) {
    res.send({ template: template.toJSON() });
  }).catch(function(err) {
    console.log(err);
    return res.status(500).send({ msg: 'Error during creation of the template' });
  });
};

/**
 * PUT /templates
 */
exports.templatesPut = function(req, res) {
  req.assert('name', 'Name cannot be blank').notEmpty();
  req.assert('parsedStructure', 'Structure cannot be blank').notEmpty();

  var errors = req.validationErrors();

  if (errors) {
    return res.status(422).send(errors);
  }

  req.currentTemplate.save({
    name: req.body.name,
    parsedStructure: req.body.parsedStructure
  }).then(function(template) {
    res.send({ template: template.toJSON() });
  }).catch(function(err) {
    console.log(err);
    return res.status(500).send({ msg: 'Error during updating of the template' });
  });
};


/**
 * DELETE /templates
 */
exports.templatesDelete = function(req, res) {
  req.currentTemplate.destroy().then(function(template) {
    res.send({ template: {} });
  }).catch(function(err) {
    console.log(err);
    return res.status(500).send({ msg: 'Error during deleting of the template' });
  });
};
