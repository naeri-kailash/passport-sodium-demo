exports.up = knex => knex.schema.table('users', t => {
  t.string('facebook')
})

exports.down = knex => knex.schema.table('users', t => {
  t.dropColumn('facebook')
})
