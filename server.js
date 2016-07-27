var express = require('express');
var path = require('path');
var logger = require('morgan');
var compression = require('compression');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var dotenv = require('dotenv');
var jwt = require('jsonwebtoken');
var moment = require('moment');
var request = require('request');

// Load environment variables from .env file
dotenv.load();

// Models
var User = require('./models/User');

// Controllers
var userController = require('./controllers/user');
var contactController = require('./controllers/contact');
var websiteController = require('./controllers/website');
var templateController = require('./controllers/template');
var websiteSectionController = require('./controllers/website_section');
var websiteSectionGitController = require('./controllers/website_section_git');

var app = express();

app.set('port', process.env.PORT || 3000);
app.use(compression());
app.use(logger('dev'));
app.use(bodyParser.json({limit:1024*1024*50, type:'application/json'}));
app.use(bodyParser.urlencoded({ extended:true,limit:1024*1024*50,type:'application/x-www-form-urlencoding' }));
app.use(expressValidator());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
  req.isAuthenticated = function() {
    var token = (req.headers.authorization && req.headers.authorization.split(' ')[1]) || req.cookies.token;
    try {
      return jwt.verify(token, process.env.TOKEN_SECRET);
    } catch (err) {
      return false;
    }
  };

  if (req.isAuthenticated()) {
    var payload = req.isAuthenticated();
    new User({ id: payload.sub })
      .fetch()
      .then(function(user) {
        req.user = user;
        next();
      });
  } else {
    next();
  }
});

app.post('/contact', contactController.contactPost);
app.put('/account', userController.ensureAuthenticated, userController.accountPut);
app.delete('/account', userController.ensureAuthenticated, userController.accountDelete);
app.post('/signup', userController.signupPost);
app.post('/login', userController.loginPost);
app.post('/forgot', userController.forgotPost);
app.post('/reset/:token', userController.resetPost);
app.get('/unlink/:provider', userController.ensureAuthenticated, userController.unlink);
app.post('/auth/google', userController.authGoogle);
app.get('/auth/google/callback', userController.authGoogleCallback);

//websites
app.get('/websites/all', websiteController.ensureAuthenticated, websiteController.websitesGet);
app.post('/websites', websiteController.ensureAuthenticated, websiteController.websitesPost);
app.put('/websites/:id', websiteController.ensureMine, websiteController.websitesPut);
app.delete('/websites/:id', websiteController.ensureMine, websiteController.websitesDelete);

//templates
app.get('/templates/all', templateController.ensureAuthenticated, templateController.templatesGet);
app.post('/templates', templateController.ensureAuthenticated, templateController.templatesPost);
app.put('/templates/:id', templateController.ensureMine, templateController.templatesPut);
app.delete('/templates/:id', templateController.ensureMine, templateController.templatesDelete);

//website sections
app.get('/websites/:websiteId/sections/all', websiteSectionController.ensureAuthenticated, websiteSectionController.websiteSectionsGet);
app.post('/websites/:websiteId/sections', websiteSectionController.ensureAuthenticated, websiteSectionController.websiteSectionsPost);
app.get('/websites/:websiteId/sections/:id/get', websiteSectionController.getCurrentSection, websiteSectionController.websiteSectionGet);
app.put('/websites/:websiteId/sections/:id', websiteSectionController.getCurrentSection, websiteSectionController.websiteSectionsPut);
app.delete('/websites/:websiteId/sections/:id', websiteSectionController.getCurrentSection, websiteSectionController.websiteSectionsDelete);

//git operations
app.get('/websites/:websiteId/sections/:id/git/clone', websiteSectionGitController.ensureAuthenticated, websiteSectionGitController.websiteSectionGitGet);
app.put('/websites/:websiteId/sections/:id/git/push', websiteSectionGitController.ensureAuthenticated, websiteSectionGitController.websiteSectionGitPut);

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'app', 'index.html'));
});

app.get('*', function(req, res) {
  res.redirect('/#' + req.originalUrl);
});

// Production error handler
if (app.get('env') === 'production') {
  app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.sendStatus(err.status || 500);
  });
}

app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});

module.exports = app;
