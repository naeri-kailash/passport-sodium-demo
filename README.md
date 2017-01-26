# Express server with Passport local auth

This demonstrates a fairly minimal username/password auth, making use of libsodium/Argon2i password hashing. There's also a tiny API to show how JWT might be used to secure it.


## Install

```shell
npm i
npm start
```

The session and JWT secrets are loaded from environment variables. Create an `.env` file with something like:

```shell
SESSION_SECRET=12345asdflksdjfj
JWT_SECRET=asldfkjsdlfk
```

Password hashing modules often have a _native_ component: they're written in lower-level languages like C or C++ with a JavaScript _wrapper_. This means they can be trickier to install on some platforms. There are some instructions for how to obtain the necessary tools to build native modules [here](https://github.com/dev-academy-programme/orientation/tree/master/3-installation/node.md).

To use the API, you'll first need to register a user with the web form. Then hit the `https://localhost:8443/api/authenticate` endpoint with a POST request containing something like:

```json
{ 
  "username": "foo",
  "password": "bar"
}
```

The server should respond with a token. You can use this token in subsequent requests. You'll need to send an `Authorization` header:

```shell
curl -k -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OCwidXNlcm5hbWUiOiJub2RleSIsImlhdCI6MTQ4NTM5NDc3MCwiZXhwIjoxNDg1NDgxMTcwfQ.EVo65RYtRlA9HTOiIqaG_aDfSE7xMedbr7JMeDlt5kE" \
  https://localhost:8443/api/closed
```

Notice the space between `Bearer` and the token. Compare the response to requests with the token and without it.


## Things to think about

This demo omits plenty of things that a production system would have to care about. For example, how could we better validate the registration form? Right now a user can be created with username ' ' and password ' ': hardly ideal!

