const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn
const express = require('express')
const passport = require('passport')
const users = require('../lib/users')

const router = express.Router()
module.exports = router

router.get('/login', (req, res) => {
  res.render('login', { flash: req.flash('error') })
})

router.post('/login',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
  }))

router.get('/logout', (req, res) => {
  req.logout()
  res.redirect('/login')
})

router.get('/',
  ensureLoggedIn(),
  (req, res) => {
    res.send('<img src="http://pawn.hss.cmu.edu/~67103/images/wombats/wombat4.jpg">')
  })

router.get('/register', (req, res) => {
  res.render('register', { flash: req.flash('error') })
})

router.post('/register',
  (req, res, next) => {
    users.exists(req.body.username)
      .then(exists => {
        if (exists) {
          req.flash('error', 'User already exists, sorry.')
          return res.redirect('/register')
        }

        // req.login() can be used to automatically log the user in after registering
        users.create(req.body.username, req.body.password)
          .then(() => res.redirect('/login'))
          .catch(() => next())
      })
      .catch(() => next())
  },
  (req, res) => {
    req.flash('error', "Couldn't add user.")
    res.redirect('/register')
  }
)
