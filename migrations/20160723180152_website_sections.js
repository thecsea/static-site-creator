
exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.createTable('website_sections', function(table) {
            table.increments();
            table.string('name');
            table.integer('website_id').unsigned().index().references('id').inTable('websites').onDelete('cascade')
                .onUpdate('cascade');
            table.integer('template_id').unsigned().index().references('id').inTable('templates').onDelete('cascade')
                .onUpdate('cascade');
            table.string('path');
            table.timestamps();
            table.unique(['website_id','path']);
        })
    ]);
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.dropTable('website_sections')
    ])
};
