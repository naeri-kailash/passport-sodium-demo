const bodyParser = require('body-parser')
const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn
const express = require('express')
const expressSession = require('express-session')
const flash = require('connect-flash')
const development = require('./knexfile').development
const knex = require('knex')(development)
const passport = require('passport')
const LocalStrategy = require('passport-local')
const sodium = require('sodium').api

const app = express()
app.use(bodyParser.urlencoded({ extended: false }))

// Normally a session secret would never be committed to source control: we'd load it
// from a .env file or come up with another way of generating it.
app.use(expressSession({
  resave: false,
  secret: 'z11k|L1Baa442N0|[68]FzjlED2DY0',
  saveUninitialized: false
}))
app.use(flash())
app.use(passport.initialize())
app.use(passport.session())

function sodiumStrategy (username, password, done) {
  knex('users')
    .select()
    .where('username', username)
    .then(users => {
      if (users.length === 0) {
        return done(null, false, { message: 'Unrecognised user.' })
      }

      const user = users[0]
      const dbPassword = new Buffer(user.password)
      const submittedPassword = new Buffer(password)
      if (!sodium.crypto_pwhash_str_verify(dbPassword, submittedPassword)) {
        return done(null, false, { message: 'Incorrect password.' })
      }
      done(null, {
        id: user.id,
        username: user.username
      })
    })
    .catch(err => {
      done(err, false, { message: 'Something bad happened.' })
    })
}

const strategy = new LocalStrategy(sodiumStrategy)
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
    .catch(err => {
      console.error(err.message)
      req.flash('error', "Couldn't add user.")
      res.redirect('/register')
    })
})

app.listen(3000, () => {
  console.log('Listening on 3000')
})
