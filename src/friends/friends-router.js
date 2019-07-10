const express = require('express')
const path = require('path');
const FriendsService = require('./friends-service')
const UsersService = require('../users/users-service')
const { requireAuth } = require('../middleware/jwt-auth')

const friendsRouter = express.Router()
const jsonBodyParser = express.json();

friendsRouter
  .route('/:user_email')
  .all(requireAuth)
  .get((req, res, next) => {
    const db = req.app.get('db');
    const { user_email } = req.params;
    UsersService.hasUserWithEmail(db, user_email)
      .then(hasUser => {
        if (!hasUser) {
          return res.status(404).json({ error: `Can't find user with email` })
        }
        FriendsService.getPropertiesForFriend(db, user_email)
          .then(properties => res.json(properties))
      })
  })

module.exports = friendsRouter