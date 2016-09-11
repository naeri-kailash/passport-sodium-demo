module.exports = {

  development: {
    client: 'sqlite3',
    connection: {
      filename: './dev.sqlite3'
    },
    useNullAsDefault: true
  },

  production: {
    client: 'postgresql',
    connection: process.env.HEROKU_POSTGRESQL,
    migrations: {
      tableName: 'knex_migrations'
    },
    pool: {
      min: 1,
      max: 10
    }
  }

}
