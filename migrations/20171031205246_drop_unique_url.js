
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('websites', function(table) {
      table.dropUnique('git_url');
      table.dropUnique('url');
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('websites', function(table) {
      table.unique('git_url');
      table.unique('url');
    })
  ]);
};
