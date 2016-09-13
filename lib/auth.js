const crypto = require('./crypto')
const jwt = require('jsonwebtoken')
const passport = require('passport')
const users = require('./users')

const config = require('../knexfile')[process.env.NODE_ENV || 'development']
const knex = require('knex')(config)

function createToken (user, secret) {
  return jwt.sign({
    id: user.id,
    username: user.username
  }, secret, {
    expiresIn: 60 * 60 * 24
  })
}

function handleError (err, req, res, next) {
  if (err) {
    return res.status(403).json({
      message: 'Access to this resource was denied.',
      error: err.message
    })
  }
  next()
}

// Mostly database errors that can't be recovered from
function handleErrorWithRedirect (err, req, res, next) {
  if (err) {
    req.flash('error', 'A server error occurred.')
    return res.redirect('/login')
  }
  next()
}

function issueJwt (req, res) {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return res.status(500).json({
        message: 'Authentication failed due to a server error.'
      })
    }

    if (!user) {
      return res.json({
        message: 'Authentication failed.',
        info: info.message
      })
    }

    const token = createToken(user, req.app.get('AUTH_SECRET'))
    res.json({
      message: 'Authentication successful.',
      token: token
    })
  })(req, res)
}

const twitterConfig = {
  consumerKey: process.env.TWITTER_KEY,
  consumerSecret: process.env.TWITTER_SECRET,
  callbackURL: '/auth/twitter/callback'
}

function getSessionUser (user) {
  return {
    id: user.id,
    username: user.username
  }
}

function twitterVerify (token, tokenSecret, profile, done) {
  const authResponse = {
    message: null,
    user: false
  }
  const userCandidate = {
    username: profile.username.toLowerCase(),
    twitter_id: profile.id
  }
  knex('users')
    .select()
    .where(userCandidate)
    .then(userList => {
      if (userList.length > 0) {
        authResponse.user = getSessionUser(userList[0])
      }
    })
    .then(() => {
      if (!authResponse.user) {
        return knex('users')
          .select()
          .where('username', userCandidate.username)
      }
    })
    .then(userList => {
      if (userList && userList.length > 0) {
        authResponse.message = { message: 'Username already exists.' }
      }
    })
    .then(() => {
      if (!authResponse.message && !authResponse.user) {
        return knex('users')
          .insert(userCandidate)
      }
    })
    .then(insert => {
      if (insert) {
        return knex('users')
          .select('id', 'username')
          .where('username', userCandidate.username)
      }
    })
    .then(userList => {
      if (userList) {
        authResponse.user = userList[0]
      }
    })
    .then(() => done(null, authResponse.user, authResponse.message))
    .catch(err => done(err, authResponse.user, { message: 'Server error.' }))
}

function verify (username, password, done) {
  users.getByName(username)
    .then(users => {
      if (users.length === 0) {
        return done(null, false, { message: 'Unrecognised user.' })
      }

      const user = users[0]
      if (!crypto.verifyUser(user, password)) {
        return done(null, false, { message: 'Incorrect password.' })
      }
      done(null, {
        id: user.id,
        username: user.username
      })
    })
    .catch(err => {
      done(err, false, { message: "Couldn't check your credentials with the database." })
    })
}

module.exports = {
  handleError: handleError,
  handleErrorWithRedirect: handleErrorWithRedirect,
  issueJwt: issueJwt,
  twitterConfig: twitterConfig,
  twitterVerify: twitterVerify,
  verify: verify
}

