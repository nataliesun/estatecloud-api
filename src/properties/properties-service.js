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
  updateProperty(knex, id, newPropertyFields) {
    return knex('estatecloud_properties')
      .where({ id })
      .update(newPropertyFields)
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


  serializeProperties(properties) {
    return properties.map(property => this.serializeProperty(property))
  },

  serializeProperty(property) {

    return {
      id: property.id,
      address: xss(property.address),
      city: xss(property.city),
      state: xss(property.state),
      date_created: property.date_created,
      status: xss(property.status),
      rent_price: property.rent_price,
      initial_price: property.initial_price,
      mortgage_payment: property.mortgage_payment,
      user_id: property.user_id
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
