
exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.table('users', function(table) {
            table.boolean('editor').defaultTo(false);
        })
    ]);
};

exports.down = function(knex, Promise) {
  
};
