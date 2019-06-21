const express = require('express');
const path = require('path');
const ReservationsService = require('./reservations-service');
const { requireAuth } = require('../middleware/jwt-auth');

const reservationsRouter = express.Router();
const jsonBodyParser = express.json();

reservationsRouter
  .route('/:property_id')
  .all(requireAuth)
  .get((req, res, next) => {
    ReservationsService.getReservationsForProperty(req.app.get('db'), req.params.property_id)
      .then(reservations => {
        res.json(ReservationsService.serializeReservations(reservations));
      })
      .catch(next);
  })

reservationsRouter
  .route('/')
  .post(requireAuth, jsonBodyParser, (req, res, next) => {
    const newReservation = req.body;


    for (const [key, value] of Object.entries(newReservation))
      if (value == null)
        return res.status(400).json({
          error: `Missing '${key}' in request body`
        });

    newReservation.user_id = req.user.id;

    ReservationsService.insertReservationForProperty(req.app.get('db'), newReservation)
      .then(reservation => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${reservation.id}`))
          .json(ReservationsService.serializeReservation(reservation));
      })
  })

reservationsRouter
  .route('/:reservation_id')
  .delete(requireAuth, (req, res, next) => {
    const { reservation_id } = req.params
    ReservationsService.deleteReservation(
      req.app.get('db'),
      reservation_id
    )
      .then(numRowsAffected => {
        if (!numRowsAffected) {
          return res
            .status(404)
            .json({ error: { message: "Reservation doesn't exist" } })
          next()
        }

        res.json(reservation_id)
      })
      .catch(next)
  })

module.exports = reservationsRouter;
