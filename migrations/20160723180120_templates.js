
exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.createTable('templates', function(table) {
            table.increments();
            table.string('name');
            table.integer('user_id').unsigned().index().references('id').inTable('users').onDelete('cascade')
                .onUpdate('cascade');
            table.json('structure');
            table.timestamps();
        })
    ]);
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.dropTable('templates')
    ])
};
