const xss = require('xss')

const ReservationsService = {
  getReservationsForProperty(db, property_id) {
    return db
      .from('estatecloud_reservations')
      .select('*')
      .where('property_id', Number(property_id))
  },

  getById(db, id) {
    return db
      .from('estatecloud_reservations')
      .select('*')
      .where('id', id)
      .first()
  },

  getReservationDetails(db, reservation_id) {
    return db
      .select(
        'res.user_id as res_user',
        'res.id as res_id',
        'usrs.first_name',
        'usrs.last_name',
        'res.date_created'
      )
      .from('estatecloud_reservations as res')
      .innerJoin('estatecloud_users as usrs', 'res.user_id', 'usrs.id')
      .where('res.id', reservation_id)
      .first()
  },

  insertReservationForProperty(db, reservation) {
    return db
      .insert(reservation)
      .into('estatecloud_reservations')
      .returning('*')
      .then(([reservation]) => reservation)
      .then(reservation => this.getById(db, reservation.id))
  },

  getReservationsAtUserProperties(db, user_id) {
    return db
      .from('estatecloud_reservations as res')
      // .select('res.user_id', 'res.id as res_id', 'property_id', 'prop.address', 'prop.user_id as prop_owner')
      .count('*')
      .innerJoin('estatecloud_properties as prop', 'res.property_id', 'prop.id')
      .where('prop.user_id', user_id)

  },

  getReservationsMadeByUser(db, user_id) {
    return db
      .from('estatecloud_reservations as res')
      // .select('res.user_id', 'res.id as res_id', 'property_id', 'prop.address', 'prop.user_id as prop_owner')
      .count('*')
      .innerJoin('estatecloud_properties as prop', 'res.property_id', 'prop.id')
      .where('res.user_id', user_id)

  },

  deleteReservation(db, id) {
    return db
      .from('estatecloud_reservations')
      .where({ id })
      .delete()
  },

  serializeReservations(reservations) {
    return reservations.map(res => ReservationsService.serializeReservation(res))
  },

  serializeReservation(reservation) {
    return {
      id: reservation.id,
      user_id: reservation.user_id,
      title: reservation.title,
      start: reservation.start_date,
      end: reservation.end_date,
    }
  }
}

module.exports = ReservationsService
