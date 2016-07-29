
exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.createTable('editors_websites', function(table) {
            table.integer('editor_id').unsigned().index().references('id').inTable('users').onDelete('cascade')
                .onUpdate('cascade');
            table.integer('website_id').unsigned().index().references('id').inTable('websites').onDelete('cascade')
                .onUpdate('cascade');
            table.unique(['editor_id','website_id']);
        })
    ]);
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.dropTable('editors_websites')
    ])
};
