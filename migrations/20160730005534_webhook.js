
exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.table('websites', function(table) {
            table.string('webhook');
        })
    ]);
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.table('websites', function(table) {
            table.dropColumn('webhook');
        })
    ]);
};
