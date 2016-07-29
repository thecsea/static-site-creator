
exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.table('websites', function(table) {
            table.string('web_hook_address');
        })
    ]);
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.table('websites', function(table) {
            table.dropColumn('web_hook_address');
        })
    ]);
};
