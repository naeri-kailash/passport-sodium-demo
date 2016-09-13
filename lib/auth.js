const crypto = require('./crypto')
const jwt = require('jsonwebtoken')
const passport = require('passport')
const users = require('./users')

module.exports = {
  handleError: handleError,
  issueJwt: issueJwt,
  verify: verify
}

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

function issueJwt (req, res) {
  passport.authenticate('local', function (err, user, info) {
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

function verify (username, password, done) {
  users.getByName(username)
    .then(function (users) {
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
    .catch(function (err) {
      done(err, false, { message: "Couldn't check your credentials with the database." })
    })
}
