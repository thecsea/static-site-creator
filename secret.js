/**
 * Created by claudio on 18/06/16.
 */
var crypto = require('crypto');
console.log('Secret: '+crypto.randomBytes(32).toString('hex'));