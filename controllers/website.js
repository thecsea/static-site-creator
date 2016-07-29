var User = require('../models/User');
var Website = require('../models/Website');
var currentWebsite = null;

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

exports.ensureMine = function(req, res, next) {
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


exports.ensureAdmin = function(req, res, next) {
  if (req.isAuthenticated() && !req.user.get('editor')) {
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
  }).catch((e)=>{
    console.log(e);
    return res.status(500).send({msg: 'Error during fetching websites'});
  });;
};

/**
 * POST /websites
 */
exports.websitesPost = function(req, res) {
  req.assert('name', 'Name cannot be blank').notEmpty();
  req.assert('url', 'Url cannot be blank').notEmpty();
  req.assert('git_url', 'Git url cannot be blank').notEmpty();

  var errors = req.validationErrors();

  if (errors) {
    return res.status(422).send(errors);
  }

  req.user.websites().create({
    name: req.body.name,
    url: req.body.url,
    git_url: req.body.git_url
  }).then(function(website) {
    res.send({ website: website.toJSON() });
  }).catch(function(err) {
    if (err.code === 'ER_DUP_ENTRY'  || err.code === 'SQLITE_CONSTRAINT') {
      return res.status(422).send({ msg: 'The url inserted was already used' });
    }else {
      console.log(err);
      return res.status(500).send({ msg: 'Error during creation of the website' });
    }
  });
};

/**
 * PUT /websites
 */
exports.websitesPut = function(req, res) {
  req.assert('name', 'Name cannot be blank').notEmpty();
  req.assert('url', 'Url cannot be blank').notEmpty();
  req.assert('git_url', 'Git url cannot be blank').notEmpty();

  var errors = req.validationErrors();

  if (errors) {
    return res.status(422).send(errors);
  }

  currentWebsite.save({
    name: req.body.name,
    url: req.body.url,
    git_url: req.body.git_url
  }).then(function(website) {
    res.send({ website: website.toJSON() });
  }).catch(function(err) {
    if (err.code === 'ER_DUP_ENTRY'  || err.code === 'SQLITE_CONSTRAINT') {
      return res.status(422).send({ msg: 'The url inserted was already used' });
    }else {
      console.log(err);
      return res.status(500).send({ msg: 'Error during updating of the website' });
    }
  });
};


/**
 * DELETE /websites
 */
exports.websitesDelete = function(req, res) {
  currentWebsite.destroy().then(function(website) {
    res.send({ website: website.toJSON() });
  }).catch(function(err) {
    console.log(err);
    return res.status(500).send({ msg: 'Error during deleting of the website' });
  });
};
