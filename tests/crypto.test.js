const sodium = require('sodium').api
const test = require('ava')

const crypto = require('../lib/crypto')

test('getHash gets correct hash', t => {
  const password = Buffer.from('password', 'utf8')
  const actual = crypto.getHash('password')
  t.truthy(sodium.crypto_pwhash_str_verify(actual, password))
})
