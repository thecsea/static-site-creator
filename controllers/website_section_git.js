var Website = require('../models/Website');
var WebsiteSection = require('../models/WebsiteSection');
var Template = require('../models/Template');
var fs = require('fs');
var Git = require('nodegit');
var tmp = require('tmp');
var currentWebsite = null;
var currentWebsiteSection = null;
var repository = null;

exports.ensureAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) {
    new WebsiteSection({id: req.params.id}).fetch({withRelated: ['website']}).then((section)=>{
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

/**
 * GET /websites/:id/sections/:id/git/clone
 */
exports.websiteSectionGitGet = function(req, res) {
    clone(currentWebsiteSection, req.user);
  //res.send({website: currentWebsite.toJSON()});
};


/**
 * PUT /websites/:id/sections/:id/git
 */
exports.websiteSectionGitPut = function(req, res) {

};

function clone(section, user){
    return user.related('sshKeys').fetch().then((ssh)=> {
        createDirectory().then((value)=>{
            var path = value.path;
            var cleanupCallback = value.cleanupCallback;
            //if (err) throw err;
            console.log("Dir: ", path);

            var url = section.related('website').get('git_url');
            ssh = ssh.pop();//TODO improve this
            var clonePath = path + 'git';
            //var localPath = require("path").join(__dirname, "tmp");

            var opts = {
                fetchOpts: {
                    callbacks: {
                        certificateCheck: function () {
                            return 1; //TODO improve this
                        },
                        credentials: function (url, userName) {
                            return Git.Cred.sshKeyNew(
                                userName,
                                path + '/public.pem',
                                path + '/private.pem',
                                "");
                        }
                    }
                }
            };

            console.log('ok1');
            fs.writeFile(path + '/public.pem', ssh.get('public'), function (err) {
                if (err) throw err;
                console.log('ok2');
                fs.writeFile(path + '/private.pem', ssh.get('private'), function (err) {
                    if (err) throw err;
                    console.log('ok3');
                    return Git.Clone(url, clonePath, opts).then(function (repo) {
                        repository = repo;
                        console.log(repo);
                        console.log('ok');
                        cleanupCallback();
                    }).catch((err)=>{console.log(err);});
                });
            });
        }).catch((err)=>{console.log(err)});
        //TODO use promise all or join
    });
}

function createDirectory(){
    return new Promise((resolve, reject)=>{
        tmp.dir({unsafeCleanup: true}, function _tempDirCreated(err, path, cleanupCallback) {
            if (err) reject(err);
            resolve({path: path, cleanupCallback: cleanupCallback});
        })
    });
}

function filePutContents(file, data){
    fs.writeFile(file, data, function (err) {
        if (err) rejct(err);
        resolve();
    });
}