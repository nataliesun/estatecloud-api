const xss = require('xss')
const Treeize = require('treeize')

const PropertiesService = {
  getAllProperties(db) {
    return db
      .from('estatecloud_properties AS prop')
      .select('*')
  },

  getPropertiesForUser(db, user_id) {
    return db
      .from('estatecloud_properties AS prop')
      .select(
        '*'
      )
      .where('prop.user_id', user_id)
  },

  getById(db, id) {
    return PropertiesService.getAllProperties(db)
      .where('prop.id', id)
      .first()
  },

  insertProperty(db, newProperty) {
    PropertiesService.fixCapitalization(newProperty)
    return db
      .insert(newProperty)
      .into('estatecloud_properties')
      .returning('*')
      .then(([property]) => property)
      .then(property => this.getById(db, property.id))
  },

  deleteProperty(db, id) {
    return db
      .from('estatecloud_properties')
      .where({ id })
      .delete()
  },

  fixCapitalization(property) {
    property.address = property.address.toLowerCase()
      .split(' ')
      .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
      .join(' ');

    property.state = property.state.toLowerCase()
      .split(' ')
      .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
      .join(' ');

    property.city = property.city.toLowerCase()
      .split(' ')
      .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
      .join(' ');

    return property;
  },


  calculateSerializedPropertyData(dbProperties) {
    const propertyData = {
      portfolio_value: 0,
      availability: [0, 0, 0],
      properties: []
    }

    if (dbProperties.length > 1) {
      propertyData.portfolio_value = dbProperties.reduce((total, current) => total.initial_price + current.initial_price)
    } else {
      propertyData.portfolio_value = dbProperties[0].initial_price
    }

    for (let i = 0; i < dbProperties.length; i++) {
      if (dbProperties[i].status === "available")
        propertyData.availability[0] = propertyData.availability[0] + 1

      else if (dbProperties[i].status === "occupied")
        propertyData.availability[1] = propertyData.availability[1] + 1

      else
        propertyData.availability[2] = propertyData.availability[2] + 1
    }

    propertyData.properties = dbProperties.map(p => {
      return {
        id: p.id,
        address: xss(p.address),
        city: xss(p.city),
        state: xss(p.state),
        rent_price: p.rent_price,
        profit: (p.rent_price - p.mortgage_payment)
      }
    })

    return propertyData
  },

  serializeProperty(property) {
    const propertyTree = new Treeize()

    // Some light hackiness to allow for the fact that `treeize`
    // only accepts arrays of objects, and we want to use a single
    // object.
    const propertyData = propertyTree.grow([property]).getData()[0]

    return {
      id: propertyData.id,
      address: xss(propertyData.address),
      city: xss(propertyData.city),
      date_created: propertyData.date_created,
      status: xss(propertyData.status),
      rent_price: propertyData.rent_price,
      initial_price: propertyData.initial_price,
      mortgage_payment: propertyData.mortgage_payment,
    }
  },

  serializeThingReview(review) {
    const reviewTree = new Treeize()

    // Some light hackiness to allow for the fact that `treeize`
    // only accepts arrays of objects, and we want to use a single
    // object.
    const reviewData = reviewTree.grow([review]).getData()[0]

    return {
      id: reviewData.id,
      rating: reviewData.rating,
      thing_id: reviewData.thing_id,
      text: xss(reviewData.text),
      user: reviewData.user || {},
      date_created: reviewData.date_created,
    }
  },
}

const userFields = [
  'usr.id AS user:id',
  'usr.user_name AS user:user_name',
  'usr.full_name AS user:full_name',
  'usr.nickname AS user:nickname',
  'usr.date_created AS user:date_created',
  'usr.date_modified AS user:date_modified',
]

module.exports = PropertiesService
