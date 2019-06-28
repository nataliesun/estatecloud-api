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
          return res.json({})
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
  .get((req, res, next) => {
    const { property_id } = req.params
    PropertiesService.getById(req.app.get('db'), property_id)
      .then(property => res.json(property))
  })
  .patch(jsonBodyParser, (req, res, next) => {

    const { address, city, state, status, rent_price, mortgage_payment, initial_price } = req.body
    const propertyToUpdate = { address, city, state, status, rent_price, mortgage_payment, initial_price }

    for (const [key, value] of Object.entries(propertyToUpdate))
      if (value == null)
        return res.status(400).json({
          error: `Missing '${key}' in request body`
        });

    PropertiesService.updateProperty(
      req.app.get('db'),
      req.params.property_id,
      propertyToUpdate
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })
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
