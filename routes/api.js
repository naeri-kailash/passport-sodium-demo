const bodyParser = require('body-parser')
const express = require('express')
const verifyJwt = require('express-jwt')

const auth = require('../lib/auth.js')

const router = express.Router()
module.exports = router
router.use(bodyParser.json())

// This is the only API route that uses local strategy, to check if we can
// issue a JWT in response to requests.
router.post('/authenticate', auth.issueJwt)

// express-jwt middleware lets us use a function as the secret,
// so we can grab it out of app settings
function getSecret (req, payload, done) {
  done(null, req.app.get('AUTH_SECRET'))
}

// This route will set the req.user object if it exists, but is still public
router.get('/open',
  verifyJwt({
    credentialsRequired: false,
    secret: getSecret
  }),
  function (req, res) {
    const json = { message: 'This route is public.' }
    if (req.user) {
      json.user = `Your user ID is: ${req.user.id}`
    }
    res.json(json)
  }
)

// Protect all routes beneath this point
router.use(
  verifyJwt({
    secret: getSecret
  }),
  auth.handleError
)

// These routes are protected
router.get('/closed', (req, res) => {
  res.json({ message: `Yup, you seem to be user ${req.user.id}.` })
})
