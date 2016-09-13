const config = require('../knexfile')[process.env.NODE_ENV || 'development']
const knex = require('knex')(config)

const crypto = require('./crypto')

module.exports = {
  check: check,
  create: create,
  createTwitter: createTwitter,
  deserialize: deserialize,
  getById: getById,
  getByName: getByName,
  getByTwitter: getByTwitter,
  serialize: serialize,
  twitterExists: twitterExists
}

function check (values) {
  const {userCandidate, authResponse} = Object.assign({}, values)
  return knex('users')
    .select()
    .where(userCandidate)
    .then(users => {
      if (users.length > 0) {
        authResponse.user = { id: users[0].id }
        return {userCandidate, authResponse}
      }
    })
    .catch(err => {
      authResponse.err = err
      authResponse.message = "Couldn't check your credentials with the database."
      return {userCandidate, authResponse}
    })
}

function create (username, password) {
  const hash = crypto.getHash(password)

  return knex('users')
    .insert({
      username: username.toLowerCase(),
      hash: hash
    })
}

function createTwitter (username, twitterId) {
  return knex('users')
    .insert({
      username: username.toLowerCase(),
      twitter_id: twitterId
    })
}

function getById (id) {
  return knex('users')
    .select('id', 'username')
    .where('id', id)
}

function getByTwitter (twitterId) {
  return knex('users')
    .select()
    .where('twitter_id', twitterId)
}

function getByName (username) {
  return knex('users')
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

function twitterExists (twitterUsername, twitterId) {
  return knex('users')
    .select()
    .where('twitter_id', twitterId)
    .orWhere('username', twitterUsername.toLowerCase())
    .then(users => {
      if (users.length > 0) {
        return users[0]
      }
      return null
    })
}
