const bodyParser = require('body-parser')
const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn
const express = require('express')
const passport = require('passport')
const users = require('../lib/users')

const router = express.Router()
module.exports = router
router.use(bodyParser.urlencoded({ extended: false }))

router.get('/login', function (req, res) {
  res.render('login', { flash: req.flash('error') })
})

router.post('/login',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
  })
)

router.get('/logout', function (req, res) {
  req.logout()
  res.redirect('/login')
})

router.get('/',
  ensureLoggedIn(),
  function (req, res) {
    res.render('index')
  }
)

router.get('/register', function (req, res) {
  res.render('register', { flash: req.flash('error') })
})

router.post('/register',
  function (req, res, next) {
    users.exists(req.body.username)
      .then(function (exists) {
        if (exists) {
          req.flash('error', 'User already exists, sorry.')
          return res.redirect('/register')
        }

        // req.login() can be used to automatically log the user in after registering
        users.create(req.body.username, req.body.password)
          .then(function () { return res.redirect('/login')} )
          .catch(function (err) {
            console.error(err)
            next()
          })
      })
      .catch(function (err) {
        console.error(err)
        next()
      })
  },
  function (req, res) {
    req.flash('error', "Couldn't add user.")
    res.redirect('/register')
  }
)
