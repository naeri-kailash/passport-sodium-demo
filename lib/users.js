const development = require('../knexfile').development
const knex = require('knex')(development)
const sodium = require('sodium').api

module.exports = {
  exists: exists,
  create: create
}

function exists (username) {
  return knex('users')
    .count('id as n')
    .where('username', username)
    .then(count => {
      return count[0].n > 0
    })
}

function create (username, password) {
  const pbuf = new Buffer(password, 'utf8')
  const hash = sodium.crypto_pwhash_str(
    pbuf,
    sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE,
    sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE
  )

  return knex('users')
    .insert({
      username: username,
      password: hash.toString()
    })
}

