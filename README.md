# Express server with Passport local auth

This demonstrates a fairly minimal username/password auth, making use of libsodium/Argon2i password hashing.


## Install

Create a `.env' file in the root directory and place the following in it

```shell
SESSION_SECRET=asecret
```

```shell
npm i
npm start
```

Password hashing modules often have a _native_ component: they're written in lower-level languages like C or C++ with a JavaScript _wrapper_. This means they can be trickier to install on some platforms. There are some instructions for how to obtain the necessary tools to build native modules [here](https://github.com/dev-academy-programme/orientation/tree/master/3-installation/node.md).


## Things to think about

This demo omits plenty of things that a production system would have to care about. For example, how could we better validate the registration form? Right now a user can be created with username ' ' and password ' ': hardly ideal!


## Investigations

### Integration tests

Write integration tests over `lib/users.js`

## Feature tests

