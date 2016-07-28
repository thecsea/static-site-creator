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
          var test = '{"testOBJ":"test"}';
          if(typeof (test) == 'object')
            console.log(JSON.parse(test));
          return JSON.parse(this.get('structure'));
        }catch(e){
          throw e;
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
