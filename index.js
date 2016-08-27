const bodyParser = require('body-parser')
const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn
const express = require('express')
const expressSession = require('express-session')
const flash = require('connect-flash')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const sodium = require('sodium').api

const development = require('./knexfile').development
const knex = require('knex')(development)

const app = express()
app.use(bodyParser.urlencoded({ extended: false }))

// Normally a session secret would never be committed to source control: we'd load it
// from a .env file or come up with another way of generating it.
app.use(expressSession({
  resave: false,
  secret: 'CHANGE THIS IN PRODUCTION!',
  saveUninitialized: false
}))
app.use(flash())
app.use(passport.initialize())
app.use(passport.session())

const strategy = new LocalStrategy(require('./lib/sodium-strategy'))
passport.use(strategy)

passport.serializeUser((user, done) => {
  done(null, user.id)
})

passport.deserializeUser((id, done) => {
  knex('users')
    .select('id', 'username')
    .where('id', id)
    .then(users => {
      if (users.length === 0) {
        return done(null, false)
      }
      done(null, users[0])
    })
    .catch(err => {
      done(err, false)
    })
})

app.get('/login', (req, res) => {
  res.send(`<p>${req.flash('error')}</p><form action="login" method="POST"><input name="username"><input name="password"><input type="submit" value="Log in"></form>`)
})

app.post('/login',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
  }))

app.get('/logout', (req, res) => {
  req.logout()
  res.redirect('/login')
})

app.get('/',
  ensureLoggedIn(),
  (req, res) => {
    res.send('Yup.')
  })

app.get('/register', (req, res) => {
  res.send(`<p>${req.flash('error')}</p><form action="register" method="POST"><input name="username"><input name="password"><input type="submit" value="Register"></form>`)
})

app.post('/register', (req, res) => {
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

app.listen(3000, () => {
  console.log('Listening on 3000')
})
