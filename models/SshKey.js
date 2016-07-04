var bookshelf = require('../config/bookshelf');
bookshelf.plugin('registry');
var User = require('./User');

var keygen = require('ssh-keygen');
var fs = require('fs');
var md5 = require('md5');

var SshKey = bookshelf.Model.extend({
  tableName: 'ssh_keys',
  hasTimestamps: true,

  hidden: ['private'],

  initialize() {
    var _this = this;
    this.on('creating', function(model, attrs, options) {
        return new Promise(function(resolve, reject) {
          _this.generateKey().then(function(val){
            model.set('public', val.public);
            model.set('private', val.private);
            resolve();
          }).catch(function (reason){
            console.error('Handle rejected promise ('+reason+') here.'); //TODO manage in a better a way
          });
        });
    });
  },

  generateKey(){
    var location = '../tmp/'+md5(Math.random());
    var password = false; // false and undefined will convert to an empty pw
    var _this = this;
    var promise = new Promise(function(resolve, reject) {
      _this.related('user').fetch().then(User => {
        var comment = User.get('name') + '@static-site.thecsea.it'; //TODO insert custom domain from env
        keygen({
          location: location,
          comment: comment,
          password: password,
          read: true,
          destroy: true //TODO destory all keys
        }, function(err, out){
          if(err) return reject(err);
          resolve({public: out.pubKey, private: out.key});
        });
      });
    });

    return promise;
  },

  user() {
    return this.belongsTo('User', 'user_id');
  }
});

module.exports = bookshelf.model('SshKey',SshKey);;
