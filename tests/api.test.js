const test = require('ava')
const request = require('supertest')

const app = require('../server')

test.before(t => {
  // Ignore the fact that the cert is unsigned
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
})

test.cb('Redirects requests without SSL', t => {
  request(app.http)
    .get('/api/open')
    .expect(301)
    .end((err, res) => {
      t.ifError(err)
      t.end()
    })
})

test.cb('Authenticate complains about no credentials', t => {
  request(app.https)
    .post('/api/authenticate')
    .send({})
    .expect(403)
    .end((err, res) => {
      t.ifError(err)
      t.is(res.body.info, 'Missing credentials')
      t.end()
    })
})

test.cb('/api/open responds without token', t => {
  request(app.https)
    .get('/api/open')
    .end((err, res) => {
      t.ifError(err)
      t.deepEqual(res.body, { message: 'This route is public.' })
      t.end()
    })
})

test.cb("/api/closed 403's without token", t => {
  request(app.https)
    .get('/api/closed')
    .expect(403)
    .end((err, res) => {
      t.ifError(err)
      t.is(res.body.error, 'No authorization token was found')
      t.end()
    })
})
