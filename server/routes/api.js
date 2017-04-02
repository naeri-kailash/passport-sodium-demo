const bodyParser = require('body-parser')
const express = require('express')
const verifyJwt = require('express-jwt')

const auth = require('../lib/auth.js')

const router = express.Router()
router.use(bodyParser.json())

// This is the only API route that uses local strategy, to check if we can
// issue a JWT in response to requests.
router.post('/authenticate', auth.issueJwt)

// express-jwt middleware lets us use a function as the secret,
// so we can grab from wherever...
function getSecret (req, payload, done) {
  done(null, process.env.JWT_SECRET)
}

// This route will set the req.user object if it exists, but is still public
router.get('/quote',
  verifyJwt({
    credentialsRequired: false,
    secret: getSecret
  }),
  (req, res) => {
    const json = { message: 'This is a quote.' }
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
router.get('/secret', (req, res) => {
  res.json({ message: `Yup, you seem to be user ${req.user.id}. This is a secret quote.` })
})

module.exports = router
