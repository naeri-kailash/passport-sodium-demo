const config = require('../../knexfile')[process.env.NODE_ENV || 'development']
const knex = require('knex')(config)
const expressSession = require('express-session')
const KnexSessionStore = require('connect-session-knex')(expressSession)

module.exports = expressSession({
  resave: false,
  saveUninitialized: false,
  secret: process.env.SESSION_SECRET,
  store: new KnexSessionStore({ knex: knex })
})
