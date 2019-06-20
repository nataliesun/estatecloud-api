const express = require('express')
const path = require('path');
const PropertiesService = require('./properties-service')
const { requireAuth } = require('../middleware/jwt-auth')

const propertiesRouter = express.Router()
const jsonBodyParser = express.json();

propertiesRouter
  .route('/')
  .all(requireAuth)
  .get((req, res, next) => {
    PropertiesService.getPropertiesForUser(req.app.get('db'), req.user.id)
      .then(properties => {
        if (!properties.length) {
          return res.status(400).json({
            error: `No properties found for user`
          })
        }
        return res.json(PropertiesService.calculateSerializedPropertyData(properties))
      })
      .catch(next)
  })

propertiesRouter
  .route('/')
  .post(requireAuth, jsonBodyParser, (req, res, next) => {

    const newProperty = req.body;

    for (const [key, value] of Object.entries(newProperty))
      if (value == null)
        return res.status(400).json({
          error: `Missing '${key}' in request body`
        });

    newProperty.user_id = req.user.id;

    PropertiesService.insertProperty(req.app.get('db'), newProperty)
      .then(property => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${property.id}`))
          .json(PropertiesService.serializeProperty(property));
      })

  })

propertiesRouter
  .route('/:property_id')
  .delete((req, res, next) => {
    const { property_id } = req.params
    PropertiesService.deleteProperty(
      req.app.get('db'),
      property_id
    )
      .then(numRowsAffected => {
        if (!numRowsAffected) {
          return res
            .status(404)
            .json({ error: { message: "Property doesn't exist" } })
          next()
        }

        res.json(property_id)
      })
      .catch(next)
  })



propertiesRouter.route('/:thing_id/reviews/')
  .all(requireAuth)
  .all(checkThingExists)
  .get((req, res, next) => {
    PropertiesService.getReviewsForThing(
      req.app.get('db'),
      req.params.thing_id
    )
      .then(reviews => {
        res.json(PropertiesService.serializeThingReviews(reviews))
      })
      .catch(next)
  })

/* async/await syntax for promises */
async function checkThingExists(req, res, next) {
  try {
    const thing = await PropertiesService.getById(
      req.app.get('db'),
      req.params.thing_id
    )

    if (!thing)
      return res.status(404).json({
        error: `Thing doesn't exist`
      })

    res.thing = thing
    next()
  } catch (error) {
    next(error)
  }
}

module.exports = propertiesRouter
