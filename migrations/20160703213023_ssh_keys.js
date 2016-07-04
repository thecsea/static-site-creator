
exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.createTable('ssh_keys', function(table) {
            table.increments();
            table.string('name');
            table.integer('user_id').unsigned().index().references('id').inTable('users').onDelete('cascade')
               .onUpdate('cascade');
            table.text('private');
            table.text('public');
            table.timestamps();
        })
    ]);
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.dropTable('users')
    ])
};
