
exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.createTable('git_status', function(table) {
            table.increments();
            table.integer('section_id').unsigned().index().references('id').inTable('website_sections').onDelete('cascade')
                .onUpdate('cascade');
            table.enum('type', ['push', 'clone']);
            table.string('status');
            table.text('data');
            table.timestamps();
        })
    ]);
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.dropTable('git_status')
    ])
};
