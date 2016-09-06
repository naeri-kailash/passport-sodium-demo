const express = require('express')
const hbs = require('express-handlebars')
const expressSession = require('express-session')
const flash = require('connect-flash')
const path = require('path')
const passport = require('passport')
const LocalStrategy = require('passport-local')

const localSodium = require('./lib/local-sodium')
const indexRoutes = require('./routes')
const apiRoutes = require('./routes/api')

process.on('unhandledRejection', (error, promise) => {
  console.error('UNHANDLED REJECTION', error.stack)
})

const app = express()
app.engine('hbs', hbs())
app.set('view engine', 'hbs')
app.set('views', path.join(__dirname, 'views'))

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
app.use('/', indexRoutes)
app.use('/api/', apiRoutes)

passport.use(new LocalStrategy(localSodium.strategy))
passport.serializeUser(localSodium.serialize)
passport.deserializeUser(localSodium.deserialize)

app.listen(3000, () => {
  console.log('Listening on 3000')
})
