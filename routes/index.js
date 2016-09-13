const bodyParser = require('body-parser')
const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn
const express = require('express')
const passport = require('passport')

const auth = require('../lib/auth')
const users = require('../lib/users')

const router = express.Router()
module.exports = router
router.use(bodyParser.urlencoded({ extended: false }))

router.get('/auth/twitter', passport.authenticate('twitter'))
router.get('/auth/twitter/callback',
  passport.authenticate('twitter', {
    failureFlash: true,
    failureRedirect: '/login',
    successRedirect: '/'
  }),
  auth.handleErrorWithRedirect
)

router.get('/login', (req, res) => {
  res.render('login', { flash: req.flash('error') })
})

router.post('/login',
  passport.authenticate('local', {
    failureFlash: true,
    failureRedirect: '/login',
    successRedirect: '/'
  })
)

router.get('/logout', (req, res) => {
  req.logout()
  res.redirect('/login')
})

router.get('/register', (req, res) => {
  res.render('register', { flash: req.flash('error') })
})

router.post('/register',
  (req, res, next) => {
    users.getByName(req.body.username)
      .then(userList => {
        if (userList.length > 0) {
          req.flash('error', 'User already exists, sorry.')
          return res.redirect('/register')
        }

        users.create(req.body.username, req.body.password)
          .then(() => {
            users.getByName(req.body.username)
              .then(userList => {
                req.login(userList[0], err => {
                  if (err) {
                    return next(err)
                  }
                  return res.redirect('/')
                })
              })
          })
          .catch(() => next())
      })
      .catch(() => next())
  },
  (req, res) => {
    req.flash('error', "Couldn't add user.")
    res.redirect('/register')
  }
)

router.get('/',
  (req, res, next) => {
    console.log(req.isAuthenticated())
    next()
  },
  ensureLoggedIn(),
  (req, res) => {
    res.render('index')
  }
)

