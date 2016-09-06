const bodyParser = require('body-parser')
const express = require('express')
const authenticate = require('express-jwt')
const jwt = require('jsonwebtoken')

const crypto = require('../lib/crypto')
const users = require('../lib/users')

const router = express.Router()
module.exports = router
router.use(bodyParser.json())

// Just as we wouldn't put the session secret in Git, a real server would never
// store the JWT signing secret here!
const secret = 'SECRET! SO, SO, SECRET!'

router.post('/authenticate', (req, res) => {
  users.getByName(req.body.username)
    .then(userList => {
      if (userList.length === 0) {
        return res.json({ success: false, message: 'Authentication failed. User not found.' })
      }

      const user = userList[0]
      if (!crypto.verifyUser(user, req.body.password)) {
        return res.json({ success: false, message: 'Authentication failed. Wrong password.' })
      }

      const token = jwt.sign({ id: user.id }, secret, {
        expiresIn: 60 * 60 * 24
      })

      res.json({
        message: 'Authentication successful.',
        token: token
      })
    })
})

router.use(
  authenticate({ secret: secret }),
  (err, req, res, next) => {
    if (err) {
      return res.status(403).json({
        message: 'Access to this resource was denied.',
        error: err.message
      })
    }
    next()
  }
)

router.get('/something', (req, res) => {
  res.json('Yup.')
})
