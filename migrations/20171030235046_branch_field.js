
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('websites', function(table) {
      table.string('branch').default('master');
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('websites', function(table) {
      table.dropColumn('branch');
    })
  ]);
};
