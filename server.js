const express = require('express')
const flash = require('connect-flash')
const forceSSL = require('express-force-ssl')
const fs = require('fs')
const hbs = require('express-handlebars')
const http = require('http')
const https = require('https')
const LocalStrategy = require('passport-local')
const passport = require('passport')
const path = require('path')

const auth = require('./lib/auth')
const users = require('./lib/users')
const session = require('./lib/session')

const apiRoutes = require('./routes/api')
const indexRoutes = require('./routes')

const app = express()

app.engine('hbs', hbs())
app.set('view engine', 'hbs')
app.set('views', path.join(__dirname, 'views'))

app.set('forceSSLOptions', { httpsPort: 8443 })
app.use(forceSSL)

app.use(session)
app.use(flash())
app.use(express.static('public'))
app.use(passport.initialize())
app.use(passport.session())

app.use('/', indexRoutes)
app.use('/api/', apiRoutes)

passport.use(new LocalStrategy(auth.verify))
passport.serializeUser(users.serialize)
passport.deserializeUser(users.deserialize)

const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
}

module.exports = {
  http: http.createServer(app),
  https: https.createServer(options, app)
}

