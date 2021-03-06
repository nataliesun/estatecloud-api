const express = require('express')
const path = require('path')
const UsersService = require('./users-service')
const { requireAuth } = require('../middleware/jwt-auth');

const usersRouter = express.Router()
const jsonBodyParser = express.json()

usersRouter
    .post('/', jsonBodyParser, (req, res, next) => {
        const { password, email, first_name, last_name } = req.body

        for (const field of ['first_name', 'email', 'password'])
            if (!req.body[field])
                return res.status(400).json({
                    error: `Missing '${field}' in request body`
                })

        // TODO: check email doesn't start with spaces

        const passwordError = UsersService.validatePassword(password)

        if (passwordError)
            return res.status(400).json({ error: passwordError })

        UsersService.hasUserWithEmail(
            req.app.get('db'),
            email
        )
            .then(hasUserWithEmail => {
                if (hasUserWithEmail)
                    return res.status(400).json({ error: `Email already taken` })

                return UsersService.hashPassword(password)
                    .then(hashedPassword => {
                        const newUser = {
                            email,
                            password: hashedPassword,
                            first_name,
                            last_name,
                            date_created: 'now()',
                        }


                        return UsersService.insertUser(
                            req.app.get('db'),
                            newUser
                        )
                            .then(user => {
                                res
                                    .status(201)
                                    .location(path.posix.join(req.originalUrl, `/${user.id}`))
                                    .json(UsersService.serializeUser(user))
                            })
                    })
            })
            .catch(next)
    })

usersRouter
    .route('/:email')
    .delete((req, res, next) => {
        const email = req.params.email;
        UsersService.deleteUserByEmail(req.app.get('db'), email)
            .then(numRows => res.json(numRows))
    })

usersRouter
    .route('/userName')
    .all(requireAuth)
    .get((req, res, next) => {
        const { id } = req.user;
        UsersService.getUserName(req.app.get('db'), id)
            .then(name => res.json(name))
    })


module.exports = usersRouter