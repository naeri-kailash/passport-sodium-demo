const config = require('../knexfile')[process.env.NODE_ENV || 'development']
const knex = require('knex')(config)

const crypto = require('./crypto')

module.exports = {
  create: create,
  deserialize: deserialize,
  exists: exists,
  getById: getById,
  getByName: getByName,
  serialize: serialize
}

function create (username, password) {
  const hash = crypto.getHash(password)

  return knex('users')
    .insert({
      username: username,
      hash: hash
    })
}

function exists (username) {
  return knex('users')
    .count('id as n')
    .where('username', username)
    .then(function (count) {
      return count[0].n > 0
    })
}

function getById (id) {
  return knex('users')
    .select('id', 'username')
    .where('id', id)
}

function getByName (username) {
  return knex('users')
    .select()
    .where('username', username)
}

function deserialize (id, done) {
  getById(id)
    .then(function (users) {
      if (users.length === 0) {
        return done(null, false)
      }
      done(null, users[0])
    })
    .catch(function (err) {
      done(err, false)
    })
}

function serialize (user, done) {
  done(null, user.id)
}
