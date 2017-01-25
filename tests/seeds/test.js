exports.seed = (knex, Promise) => {
  return knex('users').del()
    .then(() => Promise.all([
      knex('users').insert({id: 1, username: 'aardvark', hash: ''}),
      knex('users').insert({id: 2, username: 'capybara', hash: ''}),
      knex('users').insert({id: 3, username: 'ocelot', hash: ''})
    ]))
}
