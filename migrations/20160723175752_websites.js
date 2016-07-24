
exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.createTable('websites', function(table) {
            table.increments();
            table.string('name');
            table.integer('user_id').unsigned().index().references('id').inTable('users').onDelete('cascade')
                .onUpdate('cascade');
            table.string('git_url').unique();
            table.string('url').unique();
            table.timestamps();
        })
    ]);
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.dropTable('websites')
    ])
};
