var bookshelf = require('../config/bookshelf');
bookshelf.plugin('registry');
var User = require('./User');
var WebsiteSection = require('./WebsiteSection');


var Template = bookshelf.Model.extend({
  tableName: 'templates',
  hasTimestamps: true,

  hidden: ['structure'],

  user() {
    return this.belongsTo('User', 'user_id');
  },

  sections() {
    return this.hasMany('WebsiteSection');
  },

  virtuals: {
    parsedStructure: {
      get () {
        try {
          var data = this.get('structure');
          try {
            return JSON.parse(data);
          }catch(e){
            //TODO check if message/type is "unexpected token o"
            return data;
          }
        }catch(e2){
          throw e2;
        }
      },
      set: function(value) {
        try {
          this.set('structure', JSON.stringify(value));
        }catch (e)
        {
          throw e;
        }
      }
    }
  },
});

module.exports = bookshelf.model('Template',Template);;
