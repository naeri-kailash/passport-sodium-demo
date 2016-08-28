# Express server with Passport local auth

This demonstrates a fairly minimal username/password auth, making use of libsodium/Argon2i password hashing.


## Install

```shell
npm i
npm start
```


## Things to think about

This demo omits plenty of things that a production system would have to care about. For example, how could we better validate the registration form? Right now a user can be created with username ' ' and password ' ': hardly ideal!

