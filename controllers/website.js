var User = require('../models/User');
var Website = require('../models/Website');

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
    new Website({id: req.params.id}).fetch({withRelated: ['editors']}).then((website)=>{
      if(website.get('user_id') == req.user.id) {
        req.currentWebsite = website;
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
  var tmp = req.user.related('websites');
  if(req.user.get('editor'))
    tmp = tmp.fetch();
  else
    tmp = tmp.fetch({withRelated: ['editors']})
  tmp.then((websites) => {
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
  req.assert('editors', 'Editors must exists').notEmpty();
  if(req.body.webhook === undefined || req.body.webhook === null)
    req.body.webhook = '';
  //TODO webhook validation
  /*req.assert('editors', 'Editors must be an array').isArray();
  req.assert('editors.*', 'Editors must be id').isInt();*/ //TODO fix

  var errors = req.validationErrors();

  if (errors) {
    return res.status(422).send(errors);
  }

  ensureEditorsMine(req.body.editors, req.user)
  .then(()=>{
    return req.user.websites().create({
      name: req.body.name,
      url: req.body.url,
      webhook: req.body.webhook,
      git_url: req.body.git_url,
      branch: req.body.branch
    });
  })
  .then(function(website) {
    return website.editors().attach(req.body.editors).then(()=>website);
  })
  .then(function(website) {
    return website.fetch({withRelated: ['editors']});
  })
  .then((website)=>{
    res.send({ website: website.toJSON() });
  })
  .catch(function(err) {
    /*if (err.code === 'ER_DUP_ENTRY'  || err.code === 'SQLITE_CONSTRAINT' || err.code == '23505') {
      return res.status(422).send({ msg: 'The url inserted was already used' });
    }else {*/
      console.log(err);
      return res.status(500).send({ msg: 'Error during creation of the website' });
    //}
  });
};

/**
 * PUT /websites
 */
exports.websitesPut = function(req, res) {
  req.assert('name', 'Name cannot be blank').notEmpty();
  req.assert('url', 'Url cannot be blank').notEmpty();
  req.assert('git_url', 'Git url cannot be blank').notEmpty();
  req.assert('editors', 'Editors must exists').notEmpty();
  if(req.body.webhook === undefined || req.body.webhook === null)
    req.body.webhook = '';
  //TODO webhook validation
  /*req.assert('editors', 'Editors must be an array').isArray();
   req.assert('editors.*', 'Editors must be id').isInt();*/ //TODO fix

  var errors = req.validationErrors();

  if (errors) {
    return res.status(422).send(errors);
  }

  ensureEditorsMine(req.body.editors, req.user)
  .then(()=> {
    return req.currentWebsite.save({
      name: req.body.name,
      url: req.body.url,
      webhook: req.body.webhook,
      git_url: req.body.git_url,
      branch: req.body.branch
    });
  }).then(function(website) {
    return attachDetach(website, req.body.editors);
  }).then(function(website) {
    res.send({ website: website.toJSON() });
  }).catch(function(err) {
    if (err.code === 'EDITOR_NOT_MINE') {
      return res.status(422).send({ msg: 'At least one editor is not yours' });
    /*}else if (err.code === 'ER_DUP_ENTRY'  || err.code === 'SQLITE_CONSTRAINT' || err.code == '23505') {
      return res.status(422).send({ msg: 'The url inserted was already used' });*/
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
  req.currentWebsite.destroy().then(function(website) {
    res.send({ website: website.toJSON() });
  }).catch(function(err) {
    console.log(err);
    return res.status(500).send({ msg: 'Error during deleting of the website' });
  });
};


function ensureEditorsMine(editors, user){
  return user.related('editors').fetch((realEditors)=>{
    editors.forEach((value)=>{
      if(realEditors.map((value)=>{return value.id}).indexOf(value) == -1)
        Promise.reject({code: 'EDITOR_NOT_MINE', message:'At least one editor is not mine'});
    });
  });
}

function pluck(data, key){
  return data.map((value)=>{return value[key];});
}
function arrayDiff(a, b) {
  return a.filter(function(i) {return b.indexOf(i) < 0;});
};


function attachDetach(website, toSetEditors){
  var toRemove = [];
  var toAdd = [];
  return website.related('editors').fetch()
      .then((editors)=>{
        editors = pluck(editors, 'id');
        editors.forEach((value)=>{
          if(toSetEditors.indexOf(value) == -1)
            toRemove.push(value);
        });
        toAdd = arrayDiff(toSetEditors,editors);
        return Promise.all([website.editors().attach(toAdd),website.editors().detach(toRemove)]);
      }).then(()=>{return website.refresh();})
}