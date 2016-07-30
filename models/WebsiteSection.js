var bookshelf = require('../config/bookshelf');
bookshelf.plugin('registry');
var Website = require('./Website');
var Template = require('./Template');
var GitStatus = require('./Template');


//TODO check if website and template choosen are of the current user
var WebsiteSection = bookshelf.Model.extend({
  tableName: 'website_sections',
  hasTimestamps: true,

  website() {
    return this.belongsTo('Website', 'website_id');
  },

  template() {
    return this.belongsTo('Template', 'template_id');
  },

  gitStatus(){
    return this.hasMany('GitStatus', 'section_id');
  }
});

module.exports = bookshelf.model('WebsiteSection',WebsiteSection);;
