var Website = require('../models/Website');
var WebsiteSection = require('../models/WebsiteSection');
var Template = require('../models/Template');
var fs = require('fs');
var Git = require('nodegit');
var tmp = require('tmp');
var sanitizeFilename = require("sanitize-filename");
var currentWebsiteSection = null;

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
    clone(currentWebsiteSection, req.user)
        .then((data)=>{
            fileGetContents(data.clonePath +'/data/'+sanitizeFilename(currentWebsiteSection.get('path').replace(/\//gi,'_')))
                .then((text)=>{res.send({text: text});})
                .catch((err)=>{
                    //TODO check the type of the error
                    res.send({text: ''});
                });
            data.cleanupCallback();
        })
        .catch((err)=>{
            console.log(err);
            res.status(422).send({ msg: 'Error during cloning, please check if all data are corrects (clone url, path and so on)' }); //print error is unsafe
        });
};


/**
 * PUT /websites/:id/sections/:id/git
 */
exports.websiteSectionGitPut = function(req, res) {
    req.assert('text', 'Text cannot be blank').notEmpty(); //TODO not exists better

    var errors = req.validationErrors();

    if (errors) {
        return res.status(422).send(errors);
    }

    clone(currentWebsiteSection, req.user)
        .then((data)=>{
            var fileName = sanitizeFilename(currentWebsiteSection.get('path').replace(/\//gi,'_'));
            filePutContents(data.clonePath +'/data/'+fileName, req.body.text)
                .then(()=>{return CommitAndPush(data.path, data.clonePath, 'data/'+fileName)})
                .then(()=>{res.send({text: req.body.text});})
                .catch((err)=>{
                    console.log(err);
                    res.status(422).send({ msg: 'Error during pushing, please check to have the right git permissions)' }); //print error is unsafe
                });
            //data.cleanupCallback();
        })
        .catch((err)=>{
            console.log(err);
            res.status(422).send({ msg: 'Error during cloning, please check if all data are corrects (clone url, path and so on)' }); //print error is unsafe
        });
};

//TODO create a class to manage everything
function clone(section, user){
    var sshKeys = user.related('sshKeys').fetch();
    var dir = createDirectory();
    return Promise.all([sshKeys, dir]).then((values)=>{
        var ssh = values[0];
        var path = values[1].path;
        var cleanupCallback = values[1].cleanupCallback;

        var url = section.related('website').get('git_url');
        ssh = ssh.pop();//TODO improve this
        var clonePath = path + '/git';

        var opts = {
            fetchOpts: {
                callbacks: {
                    certificateCheck: function () {
                        return 1; //TODO improve this. why do we need it?
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

        return Promise.all([
            filePutContents(path + '/public.pem', ssh.get('public')),
            filePutContents(path + '/private.pem', ssh.get('private'))
            ])
            .then(()=>{return Git.Clone(url, clonePath, opts)})
            .then((repo)=>{
                return {cleanupCallback: cleanupCallback, repo: repo, clonePath: clonePath, path:path};
            }).catch((err)=>{
                cleanupCallback();
                return err;
            });
    });
}

function CommitAndPush(path, clonePath, file){
    var repo = null;
    var index = null;
    var oid = null;
    return Git.Repository.open(clonePath)
        .then(function(repoResult) {
            repo = repoResult;
            //return fse.ensureDir(path.join(repo.workdir(), directoryName));
            return '';
        })
        .then(function() {
            return repo.refreshIndex();
        })
        .then(function(indexResult) {
            index = indexResult;
        })
        .then(function() {
            return index.addByPath(file);
        })
        .then(function() {
            // this will write file to the index
            return index.write();
        })
        .then(function() {
            return index.writeTree();
        })
        .then(function(oidResult) {
            oid = oidResult;
            return Git.Reference.nameToId(repo, "HEAD");
        })
        .then(function(head) {
            return repo.getCommit(head);
        })
        .then(function(parent) {
            var author = Git.Signature.create("static website creator",
                "static-site@thecsea.it", 123456789, 60); //TODO insert current time maybe we cna use signature.now
            var committer = Git.Signature.create("static website creator",
                "static-site@thecsea.it", 987654321, 90);

            return repo.createCommit("HEAD", author, committer, "message", oid, [parent]);
        })
        .then(function(commitId) {
            //console.log("New Commit: ", commitId);
        })
        //push
        .then(function() {
            return repo.getRemote("origin");
        }).then(function(remoteResult) {

            //console.log('remote Loaded');
            remote = remoteResult;

            return remote.push(
                ["refs/heads/master:refs/heads/master"],
                {
                    callbacks: {
                        credentials: function(url, userName) {
                            return Git.Cred.sshKeyNew(
                                userName,
                                path + '/public.pem',
                                path + '/private.pem',
                                "");
                        }
                    }
                }
            );
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
    return new Promise((resolve, reject)=>{
        fs.writeFile(file, data, function (err) {
            if (err) reject(err);
            resolve();
        })
    });
}

function fileGetContents(file){
    return new Promise((resolve, reject)=>{
        fs.readFile(file, 'utf8', function (err, data) {
            if (err) reject(err);
            resolve(data);
        })
    });
}