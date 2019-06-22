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

  insertReservationForProperty(db, reservation) {
    return db
      .insert(reservation)
      .into('estatecloud_reservations')
      .returning('*')
      .then(([reservation]) => reservation)
      .then(reservation => this.getById(db, reservation.id))
  },

  getReservationsForUser(db, user_id) {
    return db
      .from('estatecloud_reservations')
      .count()
      .where('user_id', user_id)
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
