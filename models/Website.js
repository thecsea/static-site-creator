var bookshelf = require('../config/bookshelf');
bookshelf.plugin('registry');
var User = require('./User');
var WebsiteSection = require('./WebsiteSection');


var Website = bookshelf.Model.extend({
  tableName: 'websites',
  hasTimestamps: true,

  user() {
    return this.belongsTo('User', 'user_id');
  },

  editors() {
    return this.belongsToMany('User', 'editors_website', 'website_id', 'user_id');
  },

  sections() {
    return this.hasMany('WebsiteSection');
  },
});

module.exports = bookshelf.model('Website',Website);;
