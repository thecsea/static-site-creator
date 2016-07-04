var bookshelf = require('../config/bookshelf');
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
    var comment = 'joe@foobar.com'; //TODO get username
    var password = false; // false and undefined will convert to an empty pw

    var promise = new Promise(function(resolve, reject) {
    keygen({
      location: location,
      comment: comment,
      password: password,
      read: true,
      destroy: true //TODO destory all keys
    }, function(err, out){
      if(err) return reject(err); //console.log('Something went wrong: '+err);
      resolve({public: out.pubKey, private: out.key});
      //console.log('Keys created!');
      //console.log('private key: '+out.key);
      //console.log('public key: '+out.pubKey);
    })});
    return promise;
    //return {public: 'aaa', private: 'bbb'};
  },

  user() {
    return this.belongsTo(User);
  }
});

module.exports = SshKey;
