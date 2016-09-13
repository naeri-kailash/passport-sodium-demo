require('dotenv').load()
const express = require('express')
const hbs = require('express-handlebars')
const flash = require('connect-flash')
const path = require('path')
const passport = require('passport')
const LocalStrategy = require('passport-local')

const config = require('./knexfile')[process.env.NODE_ENV || 'development']
const knex = require('knex')(config)
const expressSession = require('express-session')
const KnexSessionStore = require('connect-session-knex')(expressSession)
const auth = require('./lib/auth')
const users = require('./lib/users')

const apiRoutes = require('./routes/api')
const indexRoutes = require('./routes')

const app = express()
app.engine('hbs', hbs())
app.set('view engine', 'hbs')
app.set('views', path.join(__dirname, 'views'))

app.use(expressSession({
  resave: false,
  saveUninitialized: false,
  secret: process.env.SESSION_SECRET,
  store: new KnexSessionStore({ knex: knex })
}))

app.use(flash())
app.use(passport.initialize())
app.use(passport.session())
app.use('/', indexRoutes)
app.use('/api/', apiRoutes)

passport.use(new LocalStrategy(auth.verify))
passport.serializeUser(users.serialize)
passport.deserializeUser(users.deserialize)

module.exports = app
