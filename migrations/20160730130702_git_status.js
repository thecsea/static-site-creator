
exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.createTable('git_status', function(table) {
            table.increments();
            table.integer('section_id').unsigned().index().references('id').inTable('website_sections').onDelete('cascade')
                .onUpdate('cascade');
            table.enum('type', ['push', 'clone']);
            table.boolean('error');
            table.integer('status');
            table.integer('total_status');
            table.text('status_description');
            table.text('data');
            table.boolean('completed');
            table.timestamps();
        })
    ]);
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.dropTable('git_status')
    ])
};
