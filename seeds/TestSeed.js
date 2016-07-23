var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');

exports.seed = function(knex, Promise) {
  return Promise.join(
    // Deletes ALL existing entries
    knex('users').del(),
    knex('ssh_keys').del(),

    // Inserts seed entries
    new Promise(function(resolve, reject) {
      bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash('test', salt, null, function(err, hash) {
          resolve(hash);
        });
      })
    }).then(function(hash){
      return knex('users').insert({id: 1, name: 'test', email:'test@test.com', password:hash});
    }),

    knex('ssh_keys').insert({id: 1, user_id:1, name: 'test_key', private:'privateKEY', public:'PUBLICKEY'})
  );
};
