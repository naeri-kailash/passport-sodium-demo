require('dotenv').config()

const fs = require('fs')
const http = require('http')
const https = require('https')

const app = require('./server')

const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
}

const server = http.createServer(app)
const secureServer = https.createServer(options, app)

server.listen(8000)
secureServer.listen(8443)
