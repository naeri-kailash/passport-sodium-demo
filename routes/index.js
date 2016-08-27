const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn
const express = require('express')
const passport = require('passport')
const sodium = require('sodium').api

const development = require('../knexfile').development
const knex = require('knex')(development)

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
    res.send('Yup.')
  })

router.get('/register', (req, res) => {
  res.render('register', { flash: req.flash('error') })
})

router.post('/register', (req, res) => {
  // Check username doesn't already exist
  knex('users')
    .count('id as n')
    .where('username', req.body.username)
    .then(count => {
      if (count[0].n > 0) {
        req.flash('error', 'User already exists, sorry.')
        return res.redirect('/register')
      }
      if (!req.body.password || !req.body.username) {
        req.flash('error', "You'll need a username and password.")
        return res.redirect('/register')
      }

      // Don't store the password in plaintext: hash it with libsodium
      const pbuf = new Buffer(req.body.password, 'utf8')
      const hash = sodium.crypto_pwhash_str(
        pbuf,
        sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE,
        sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE
      )

      // Add the user to the database
      knex('users')
        .insert({
          username: req.body.username,
          password: hash.toString()
        })
        .then(() => {
          res.redirect('/login')
        })
    })
    .catch(() => {
      req.flash('error', "Couldn't add user.")
      res.redirect('/register')
    })
})
