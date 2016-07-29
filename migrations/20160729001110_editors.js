
exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.table('users', function(table) {
            table.boolean('editor').defaultTo(false);
            table.integer('parent_id').unsigned().index().references('id').inTable('users').onDelete('cascade')
                .onUpdate('cascade');
        })
    ]);
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.table('users', function(table) {
            table.dropColumn('editor');
            table.dropColumn('parent_id');
        })
    ]);
};
