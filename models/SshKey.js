var bookshelf = require('../config/bookshelf');
var User = require('./User');

var SshKey = bookshelf.Model.extend({
  tableName: 'ssh_keys',
  hasTimestamps: true,

  constructor: function() {
    var data = arguments;
    data[0] = Object.assign(data[0], this.generateKey());
    bookshelf.Model.apply(this, data);
  },

  generateKey(){
    return {public: 'aaa', private: 'bbb'};
  },

  user() {
    return this.belongsTo(User);
  }
});

module.exports = SshKey;
