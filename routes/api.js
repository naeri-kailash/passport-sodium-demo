const bodyParser = require('body-parser')
const express = require('express')
const jwt = require('jsonwebtoken')

const crypto = require('../lib/crypto')
const users = require('../lib/users')

const router = express.Router()
module.exports = router
router.use(bodyParser.json())

const secret = 'SECRET! SO, SO, SECRET!'

router.post('/authenticate', (req, res) => {
  users.getByName(req.body.username)
    .then(users => {
      if (users.length === 0) {
        return res.json({ success: false, message: 'Authentication failed. User not found.' })
      }

      const user = users[0]
      if (!crypto.verifyUser(user, req.body.password)) {
        return res.json({ success: false, message: 'Authentication failed. Wrong password.' })
      }

      const token = jwt.sign({ id: user.id }, secret, {
        expiresIn: 60 * 60 * 24
      })

      res.json({
        success: true,
        message: 'Wombats are awesome.',
        token: token
      })
    })
})

router.use((req, res, next) => {
  const token = req.headers['x-access-token']

  if (token) {
    return jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        return res.status(403).send({ success: false, message: 'Failed to authenticate token.' })
      }
      req.decoded = decoded
      return next()
    })
  }
  res.status(403).send({ success: false, message: 'Access to this route requires a valid token.' })
})

router.get('/something', (req, res) => {
  res.json('Yup.')
})
