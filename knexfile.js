var dotenv = require('dotenv');

dotenv.load();

if(process.env.POSTGRESQL){
  module.exports = {
    client: 'postgresql',
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    }
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
