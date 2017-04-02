const config = require('../../knexfile')[process.env.NODE_ENV || 'development']
const knex = require('knex')(config)

const crypto = require('./crypto')

module.exports = {
  create,
  createFacebook,
  deserialize,
  exists,
  getByFacebook,
  getById,
  getByName,
  serialize
}

function create (username, password, testDb) {
  const hash = crypto.getHash(password)
  const connection = testDb || knex

  return connection('users')
    .insert({
      username: username,
      hash: hash
    })
}

function createFacebook (profile, testDb) {
  const connection = testDb || knex
  return connection('users')
    .insert({
      username: profile.emails[0].value,
      facebook: profile.id
    })
}

function exists (username, testDb) {
  const connection = testDb || knex
  return connection('users')
    .count('id as n')
    .where('username', username)
    .then(count => {
      return count[0].n > 0
    })
}

function getByFacebook (id, testDb) {
  const connection = testDb || knex
  return connection('users')
    .select('id', 'username')
    .where('facebook', id)
}

function getById (id, testDb) {
  const connection = testDb || knex
  return connection('users')
    .select('id', 'username')
    .where('id', id)
}

function getByName (username, testDb) {
  const connection = testDb || knex
  return connection('users')
    .select()
    .where('username', username)
}

function deserialize (id, done) {
  getById(id)
    .then(users => {
      if (users.length === 0) {
        return done(null, false)
      }
      done(null, users[0])
    })
    .catch(err => done(err, false))
}

function serialize (user, done) {
  done(null, user.id)
}
