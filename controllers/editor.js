var User = require('../models/User');
var currentEditor = null;

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
    new User({id: req.params.id}).fetch().then((editor)=>{
      if(editor.get('parent_id') == req.user.id) {
        currentEditor = editor;
        next();
      }else
        res.status(403).send({ msg: 'Forbidden' });
    }).catch(()=>{
      res.status(404).send({ msg: 'Wrong editor id' });
    });
  } else {
    res.status(401).send({ msg: 'Unauthorized' });
  }
};


/**
 * GET /editors/all
 */
exports.editorsGet = function(req, res) {
  req.user.related('editors').fetch().then((editors) => {
    res.send({editors: editors.toJSON()});
  }).catch((e)=>{
    console.log(e);
    return res.status(500).send({msg: 'Error during fetching editors'});
  });;
};

/**
 * POST /editors
 */
exports.editorsPost = function(req, res) {
  req.assert('name', 'Name cannot be blank').notEmpty();
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('email', 'Email cannot be blank').notEmpty();
  req.assert('password', 'Password must be at least 4 characters long').len(4);
  req.sanitize('email').normalizeEmail({ remove_dots: false });

  var errors = req.validationErrors();

  if (errors) {
    return res.status(422).send(errors);
  }

  req.user.editors().create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    editor: true
  }).then(function(editor) {
    res.send({ editor: editor.toJSON() });
  }).catch(function(err) {
    if (err.code === 'ER_DUP_ENTRY'  || err.code === 'SQLITE_CONSTRAINT' || err.code == '23505') {
      return res.status(422).send({ msg: 'The email address you have entered is already associated with another account.' });
    }else {
      console.log(err);
      return res.status(500).send({ msg: 'Error during creation of the editor' });
    }
  });
};

/**
 * PUT /editors
 */
exports.editorsPut = function(req, res) {
  if ('password' in req.body) {
    req.assert('password', 'Password must be at least 4 characters long').len(4);
    //req.assert('confirm', 'Passwords must match').equals(req.body.password); //TODO restore this
  }
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('email', 'Email cannot be blank').notEmpty();
  req.sanitize('email').normalizeEmail({ remove_dots: false });

  var errors = req.validationErrors();

  if (errors) {
    return res.status(422).send(errors);
  }

  var obj = {
    email: req.body.email,
    name: req.body.name,
    gender: req.body.gender,
    location: req.body.location,
    website: req.body.website
  };
  if ('password' in req.body) {
    obj.password = req.body.password;
  }

  currentEditor.save(obj, { patch: true }).then(function(editor) {
    res.send({ editor: editor.toJSON() });
  }).catch(function(err) {
    if (err.code === 'ER_DUP_ENTRY'  || err.code === 'SQLITE_CONSTRAINT' || err.code == '23505') {
      return res.status(422).send({ msg: 'The email address you have entered is already associated with another account.' });
    }else {
      console.log(err);
      return res.status(500).send({ msg: 'Error during updating of the editor' });
    }
  });
};


/**
 * DELETE /editors
 */
exports.editorsDelete = function(req, res) {
  currentEditor.destroy().then(function(editor) {
    res.send({ editor: editor.toJSON() });
  }).catch(function(err) {
    console.log(err);
    return res.status(500).send({ msg: 'Error during deleting of the editor' });
  });
};
