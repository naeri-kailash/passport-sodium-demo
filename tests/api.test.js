const test = require('ava')
const request = require('supertest')

const app = require('../server/server')

test.cb('Authenticate complains about no credentials', t => {
  request(app)
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
  request(app)
    .get('/api/open')
    .end((err, res) => {
      t.ifError(err)
      t.deepEqual(res.body, { message: 'This route is public.' })
      t.end()
    })
})

test.cb("/api/closed 403's without token", t => {
  request(app)
    .get('/api/closed')
    .expect(403)
    .end((err, res) => {
      t.ifError(err)
      t.is(res.body.error, 'No authorization token was found')
      t.end()
    })
})
