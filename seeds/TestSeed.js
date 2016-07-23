var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');

exports.seed = function(knex, Promise) {
  return Promise.join(
      // Deletes ALL existing entries
      knex('users').del(),
      knex('ssh_keys').del(),
      knex('websites').del(),
      knex('templates').del(),

      //user
      new Promise(function(resolve, reject) {
        bcrypt.genSalt(10, function(err, salt) {
          bcrypt.hash('test', salt, null, function(err, hash) {
            resolve(hash);
          });
        })
      }).then(function(hash){
        return knex('users').insert({id: 1, name: 'test', email:'test@test.com', password:hash});
      }),

      //ssh keys
      knex('ssh_keys').insert({id: 1, user_id:1, name: 'test_key', private:'privateKEY', public:'PUBLICKEY'}),

      //websites
      knex('websites').insert({id: 1, user_id:1, name: 'test_website', git_url:'git@git', url:'example.com'}),
      knex('websites').insert({id: 2, user_id:1, name: 'test_website2', git_url:'git@git2', url:'example2.com'}),

      //templates
      knex('templates').insert({id: 1, user_id:1, name: 'test_template', structure:JSON.stringify({test:'aa', test2:'bbb'})}),
      knex('templates').insert({id: 2, user_id:1, name: 'test_template2', structure:JSON.stringify({test:'aa2', test2:'bbb2'})})
  );
};
