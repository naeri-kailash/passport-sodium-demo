require('dotenv').config()

const server = require('./server')

server.http.listen(8000)
server.https.listen(8443)
