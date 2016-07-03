var dotenv = require('dotenv');
var pg = require('pg');

dotenv.load();


pg.defaults.ssl = true;
if(process.env.DATABASE_URL){
  module.exports = {
    client: 'pg',
    connection: process.env.DATABASE_URL+'?ssl=true'
  };
}else {
  module.exports = {
    client: 'sqlite',
    connection: {
      filename: './dev.sqlite3'
    },
    useNullAsDefault: true
  };
}
