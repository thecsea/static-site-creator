var bookshelf = require('../config/bookshelf');
bookshelf.plugin('registry');
var User = require('./User');


var Website = bookshelf.Model.extend({
  tableName: 'websites',
  hasTimestamps: true,

  user() {
    return this.belongsTo('User', 'user_id');
  }
});

module.exports = bookshelf.model('Website',Website);;
