const knex = require('knex')
const sodium = require('sodium').api
const test = require('ava')

const config = require('../knexfile').test
const crypto = require('../lib/crypto')
const users = require('../lib/users')

test.beforeEach(t => {
  t.context.db = knex(config)
  return t.context.db
    .migrate.latest()
    .then(() => t.context.db.seed.run())
})

test.afterEach(t => t.context.db.destroy())

test('getHash returns verifiable hash in buffer', t => {
  const password = Buffer.from('password', 'utf8')
  const actual = crypto.getHash('password')
  t.truthy(sodium.crypto_pwhash_str_verify(actual, password))
})

test('verifyUser verifies user with correct password', t => {
  // Passwords same as usernames in test db!
  return users.getByName('aardvark', t.context.db)
    .then(([ user ]) => t.truthy(crypto.verifyUser(user, 'aardvark')))
})

test('verifyUser does not veryfiy user with incorrect password', t => {
  return users.getByName('capybara', t.context.db)
    .then(([ user ]) => t.falsy(crypto.verifyUser(user, 'wrong password')))
})
