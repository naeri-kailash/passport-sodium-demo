const test = require('ava')
const knex = require('knex')
const request = require('supertest')

const app = require('../server')

const config = require('../knexfile').test

test.beforeEach(t => {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
  t.context.db = knex(config)
  return t.context.db
    .migrate.latest()
    .then(() => t.context.db.seed.run())
})

test.afterEach(t => t.context.db.destroy())

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
