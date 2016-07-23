var bookshelf = require('../config/bookshelf');
bookshelf.plugin('registry');
var User = require('./User');


var Template = bookshelf.Model.extend({
  tableName: 'templates',
  hasTimestamps: true,

  hidden: ['structure'],

  user() {
    return this.belongsTo('User', 'user_id');
  },

  virtuals: {
    structureParsed: {
      get () {
        return JSON.parse(this.get('structure'));
      },
      set: function(value) {
        model.set('structure', JSON.stringify(value));
      }
    }
  },
});

module.exports = bookshelf.model('Template',Template);;
