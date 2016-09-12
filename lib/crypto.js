const sodium = require('sodium').api

module.exports = {
  getHash: getHash,
  verifyUser: verifyUser
}

function getHash (password) {
  const passwordBuffer = new Buffer(password, 'utf8')
  const hash = sodium.crypto_pwhash_str(
    passwordBuffer,
    sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE,
    sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE
  )

  return hash
}

function verifyUser (user, password) {
  const hash = new Buffer(user.hash, 'utf8')
  const passwordBuffer = new Buffer(password, 'utf8')
  return sodium.crypto_pwhash_str_verify(hash, passwordBuffer)
}
