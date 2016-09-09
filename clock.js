/**
 * Created by claudio on 09/09/16.
 */
var CronJob = require('cron').CronJob;
var freedb = require('./freedb');

new CronJob('* * * * * *', function() {
    freedb();
}, null, true, null);