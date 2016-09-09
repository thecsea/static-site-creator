/**
 * Created by claudio on 09/09/16.
 */
var config = require('./knexfile');
var knex = require('knex')(config);

module.exports = function() {
    var dateOffset = (24 * 60 * 60 * 1000) * 5; //5 days
    var myDate = new Date();
    myDate.setTime(myDate.getTime() - dateOffset);
    knex('git_status')
        .where('updated_at', '<=', myDate)
        .del()
        .then(data=>console.log("Delete done"))
        .catch(err=>console.error(err))
        .finally(() => {
            // To close the connection pool
            knex.destroy();
        });
}