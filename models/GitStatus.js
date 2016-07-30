var bookshelf = require('../config/bookshelf');
bookshelf.plugin('registry');
var WebsiteSection = require('./WebsiteSection');


var GitStatus = bookshelf.Model.extend({
  tableName: 'git_status',
  hasTimestamps: true,

  section() {
    return this.belongsTo('WebsiteSection', 'section_id');
  },
});

module.exports = bookshelf.model('GitStatus',GitStatus);;
