const bodyParser = require('body-parser')
const express = require('express')
const authenticate = require('express-jwt')
const jwt = require('jsonwebtoken')
const passport = require('passport')

const router = express.Router()
module.exports = router
router.use(bodyParser.json())

// This route is public. It accepts a POST request with JSON body:
// {
//   "username": "foo",
//   "password": "bar"
// }
// This should obviously be sent via HTTPS.
router.post('/authenticate', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return res.status(500).json({
        message: 'Authentication failed due to a server error.',
        error: err.message
      })
    }

    if (!req.user) {
      return res.json({
        message: 'Authentication failed.',
        info: info
      })
    }

    const token = jwt.sign({ id: user.id }, req.app.get('AUTH_SECRET'), {
      expiresIn: 60 * 60 * 24
    })

    res.json({
      message: 'Authentication successful.',
      token: token
    })
  })(req, res)
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

// express-jwt middleware lets us use a function as the secret,
// so we can grab it out of app settings
function getSecret (req, payload, done) {
  done(null, req.app.get('AUTH_SECRET'))
}

// This route will set the req.user object if it exists, but is still public
router.get('/open',
  authenticate({
    credentialsRequired: false,
    secret: getSecret
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
  authenticate({
    secret: getSecret
  }),
  handleAuthError
)

// These routes are protected
router.get('/closed', (req, res) => {
  res.json({ message: `Yup, you seem to be user ${req.user.id}.` })
})
