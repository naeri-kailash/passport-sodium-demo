const bodyParser = require('body-parser')
const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn
const express = require('express')
const passport = require('passport')
const users = require('../lib/users')

const router = express.Router()
router.use(bodyParser.urlencoded({ extended: false }))

router.get('/login', (req, res) => {
  res.render('login', { flash: req.flash('error') })
})

router.post('/login',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
  })
)

router.get('/logout', (req, res) => {
  req.logout()
  res.redirect('/login')
})

router.get('/',
  ensureLoggedIn(),
  (req, res) => {
    res.render('index')
  }
)

router.get('/register', (req, res) => {
  res.render('register', { flash: req.flash('error') })
})

router.post('/register',
  register,
  registerFail
)

function register (req, res, next) {
  users.exists(req.body.username)
    .then(exists => {
      if (exists) {
        req.flash('error', 'User already exists, sorry.')
        return res.redirect('/register')
      }

      // req.login() can be used to automatically log the user in after registering
      users.create(req.body.username, req.body.password)
        .then(() => res.redirect('/login'))
    })
    .catch(() => next())
}

function registerFail (req, res) {
  req.flash('error', "Couldn't add user.")
  res.redirect('/register')
}

router.get('/auth/facebook', passport.authenticate('facebook'))

router.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('/')
  }
)

module.exports = router
