const express = require('express');
const path = require('path');
const ReservationsService = require('./reservations-service');
const { requireAuth } = require('../middleware/jwt-auth');

const reservationsRouter = express.Router();
const jsonBodyParser = express.json();

reservationsRouter
  .route('/user')
  .all(requireAuth)
  .get((req, res, next) => {
    const { id } = req.user

    Promise.all([ReservationsService.getReservationsAtUserProperties(req.app.get('db'), id), ReservationsService.getReservationsMadeByUser(req.app.get('db'), id)])
      .then(([owned, made]) => {
        const reservations = {
          owned: parseInt(owned[0].count),
          made: parseInt(made[0].count)
        }
        res.json(reservations)
      })
      .catch(next);
  })

reservationsRouter
  .route('/property/:property_id')
  .all(requireAuth)
  .get((req, res, next) => {
    ReservationsService.getReservationsForProperty(req.app.get('db'), req.params.property_id)
      .then(reservations => {
        res.json(ReservationsService.serializeReservations(reservations));
      })
      .catch(next);
  })

reservationsRouter
  .route('/reservation/:reservation_id')
  .all(requireAuth)
  .get((req, res, next) => {
    ReservationsService.getReservationDetails(req.app.get('db'), req.params.reservation_id)
      .then(details => {
        if (!details) {
          res.status(404).json({ error: `Reservation doesn't exist` })
          next()
        }
        res.json(details)
      })
      .catch(next);
  })

reservationsRouter
  .route('/')
  .all(requireAuth)
  .get((req, res, next) => {
    ReservationsService.getAllReservations(req.app.get('db'))
      .then(reservations => res.json(ReservationsService.serializeReservations(reservations)))
  })
  .post(jsonBodyParser, (req, res, next) => {
    const newReservation = {
      title: req.body.title,
      start_date: req.body.start_date,
      end_date: req.body.end_date,
      property_id: req.body.property_id
    };


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
          res
            .status(404)
            .json({ error: { message: "Reservation doesn't exist" } })
          next()
        }

        res.status(202).json(parseInt(reservation_id))
      })
      .catch(next)
  })


module.exports = reservationsRouter;
