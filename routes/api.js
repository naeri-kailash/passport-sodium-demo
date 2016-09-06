const bodyParser = require('body-parser')
const express = require('express')
const authenticate = require('express-jwt')
const jwt = require('jsonwebtoken')

const crypto = require('../lib/crypto')
const users = require('../lib/users')

const router = express.Router()
module.exports = router
router.use(bodyParser.json())

// This route is public. It accepts a POST request with JSON body:
// {
//   "username": "foo",
//   "password": "bar"
// }
// This should obviously be sent via HTTPS.
router.post('/authenticate', (req, res) => {
  users.getByName(req.body.username)
    .then(userList => {
      if (userList.length === 0) {
        return res.json({ message: 'Authentication failed. User not found.' })
      }

      const user = userList[0]
      if (!crypto.verifyUser(user, req.body.password)) {
        return res.json({ message: 'Authentication failed. Wrong password.' })
      }

      const token = jwt.sign({ id: user.id }, req.app.get('AUTH_SECRET'), {
        expiresIn: 60 * 60 * 24
      })

      res.json({
        message: 'Authentication successful.',
        token: token
      })
    })
    .catch(err => {
      res.status(500).json({
        message: 'Authentication failed due to a server error.',
        error: err.message
      })
    })
})

function handleAuthError (err, req, res, next) {
  if (err) {
    return res.status(403).json({
      message: 'Access to this resource was denied.',
      error: err.message
    })
  }
  next()
}

// This route will set the req.user object if it exists, but is still public
router.get('/open',
  authenticate({
    credentialsRequired: false,
    secret: (req, payload, done) => done(null, req.app.get('AUTH_SECRET'))
  }),
  (req, res) => {
    const json = { message: 'This route is public.' }
    if (req.user) {
      json.user = `Your user ID is: ${req.user.id}`
    }
    res.json(json)
  }
)

// Protect all routes beneath this point
router.use(
  // express-jwt middleware lets us use a function as the secret, which we can
  // use to grab it out of the app configuration settings
  authenticate({
    secret: (req, payload, done) => done(null, req.app.get('AUTH_SECRET'))
  }),
  handleAuthError
)

// These routes are protected
router.get('/closed', (req, res) => {
  res.json({ message: `Yup, you seem to be user ${req.user.id}.` })
})
