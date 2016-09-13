exports.up = function (knex, Promise) {
  return knex.schema.table('users', table => {
    table.string('twitter_id')
  })
}

exports.down = function (knex, Promise) {
  return knex.schema.table('users', table => {
    table.dropColumn('twitter_id')
  })
}
