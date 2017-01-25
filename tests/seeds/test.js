const sodium = require('sodium').api

// Makes the tests inevitably slow!
const makeHash = password => sodium.crypto_pwhash_str(
  Buffer.from(password, 'utf8'),
  sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE,
  sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE
)

exports.seed = (knex, Promise) => {
  return knex('users').del()
    .then(() => Promise.all([
      knex('users').insert({id: 1, username: 'aardvark', hash: makeHash('aardvark')}),
      knex('users').insert({id: 2, username: 'capybara', hash: makeHash('capybara')})
    ]))
}
