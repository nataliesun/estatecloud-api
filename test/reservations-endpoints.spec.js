const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')

describe('Reservations Endpoints', function () {
  let db

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    })
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())

  before('cleanup', () => helpers.cleanTables(db))

  afterEach('cleanup', () => helpers.cleanTables(db))

  describe(`Unauthorized requests`, () => {
    const testUsers = helpers.makeUsersArray()
    // const testProperties = helpers.makePropertiesArray(testUsers)

    beforeEach('insert users', () => {
      return db
        .into('estatecloud_users')
        .insert(testUsers)
    })

    // beforeEach('insert properties', () => {
    //   return db
    //     .into('estatecloud_properties')
    //     .insert(testProperties)
    // })

    it('responds with 401 Unauthorized for GET /api/reservations/user', () => {
      return supertest(app)
        .get('/api/reservations/user')
        .expect(401, { error: 'Missing bearer token' })
    })

    it(`responds with 401 Unauthorized for get /api/reservations/property/:property_id`, () => {
      return supertest(app)
        .get('/api/reservations/property/:property_id')
        // .send({
        //   address: 'Fake Test St',
        //   city: 'Testtown',
        //   state: 'CA',
        //   status: 'rented',
        //   rent_price: '1000',
        //   initial_price: '1000000',
        //   mortgage_payment: '500',
        //   date_created: '2029-01-22T16:28:32.615Z',
        //   user_id: testUsers[1].id,
        // })
        .expect(401, { error: 'Missing bearer token' })
    })

    it(`responds with 401 Unauthorized for GET /api/reservation/reservation/:reservation_id`, () => {
      // const secondProperty = testProperties[1]
      return supertest(app)
        .get(`/api/reservations/reservation/:reservation_id`)
        .expect(401, { error: 'Missing bearer token' })
    })

    it(`responds with 401 Unauthorized for POST /api/reservations`, () => {
      // const secondProperty = testProperties[1]
      return supertest(app)
        .post(`/api/reservations`)
        .expect(401, { error: 'Missing bearer token' })
    })

    it(`responds with 401 Unauthorized for DELETE /api/reservations/:reservation_id`, () => {
      // const aProperty = testProperties[1]
      return supertest(app)
        .delete(`/api/properties/:reservation_id`)
        .expect(401, { error: 'Missing bearer token' })
    })
  })

  describe(`GET /api/reservations/user`, () => {
    const testUsers = helpers.makeUsersArray()
    const testUser = testUsers[0]
    const testProperties = helpers.makePropertiesArray(testUsers)
    const testReservations = helpers.makeReservationsArray(testUsers, testProperties)

    beforeEach(() =>
      helpers.seedUsers(db, testUsers)
    )

    context(`Given no reservations`, () => {

      it(`responds with 200 { owned: 0, made: 0 }`, () => {
        return supertest(app)
          .get('/api/reservations/user')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200, { owned: 0, made: 0 })
      })
    })

    context('Given there are reservations in the database', () => {
      beforeEach('insert reservations', () =>
        helpers.seedReservations(
          db,
          testProperties,
          testReservations
        )
      )

      it('responds with 200 and a count of reservations', () => {
        const expectedReservations = helpers.makeExpectedReservationCount(testUser, testProperties, testReservations)


        return supertest(app)
          .get('/api/reservations/user')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200, expectedReservations)
      })
    })

    // context(`Given an XSS attack article`, () => {
    //   const {
    //     maliciousReservation,
    //     expectedReservation,
    //   } = helpers.makeMaliciousReservation(testUser)

    //   beforeEach('insert malicious reservation', () => {
    //     return helpers.seedMaliciousReservation(
    //       db,
    //       maliciousReservation,
    //     )
    //   })

    //   it('removes XSS attack content', () => {
    //     return supertest(app)
    //       .get(`/api/properties`)
    //       .set('Authorization', helpers.makeAuthHeader(testUser))
    //       .expect(200)
    //       .expect(res => {
    //         expect(res.body[0].address).to.eql(expectedReservation.address)
    //         expect(res.body[0].city).to.eql(expectedReservation.city)
    //       })
    //   })
    // })

  })

  describe(`GET /api/reservations/property/:property_id`, () => {
    const testUsers = helpers.makeUsersArray()
    const testUser = testUsers[0]
    const testProperties = helpers.makePropertiesArray(testUsers)
    const testReservations = helpers.makeReservationsArray(testUsers, testProperties)

    beforeEach(() =>
      helpers.seedUsers(db, testUsers)
    )

    context(`Given no reservations`, () => {
      it(`responds with 200 and an empty array`, () => {
        const propertyId = 123456
        return supertest(app)
          .get(`/api/reservations/property/${propertyId}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200, [])
      })
    })

    context('Given there are reservations in the database', () => {
      beforeEach('insert reservations', () =>
        helpers.seedReservations(
          db,
          testProperties,
          testReservations
        )
      )

      it('responds with 200 and reservations for the specified property', () => {
        const testPropertyId = testProperties[1].id
        const expectedReservations = helpers.makeExpectedReservationsForProperty(testPropertyId, testReservations)

        return supertest(app)
          .get(`/api/reservations/property/${testPropertyId}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200, expectedReservations)
      })
    })

    context(`Given an XSS attack reservation`, () => {
      const testProperty = testProperties.find(p => p.user_id === testUser.id)

      beforeEach('insert properties', () =>
        helpers.seedProperties(
          db,
          testProperties
        )
      )

      const {
        maliciousReservation,
        expectedReservation,
      } = helpers.makeMaliciousReservation(testUser, testProperty)

      beforeEach('insert malicious reservation', () => {
        return helpers.seedMaliciousReservation(
          db,
          maliciousReservation,
        )
      })

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/reservations/property/${testProperty.id}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200)
          .expect(res => {
            expect(res.body[0].title).to.eql(expectedReservation.title)
          })
      })
    })
  })

  describe(`GET /api/reservations/reservation/:reservation_id`, () => {
    const testUsers = helpers.makeUsersArray()
    const testUser = testUsers[0]
    const testProperties = helpers.makePropertiesArray(testUsers)
    const testReservations = helpers.makeReservationsArray(testUsers, testProperties)

    beforeEach(() =>
      helpers.seedUsers(db, testUsers)
    )

    context(`Given no reservations`, () => {
      it(`responds with 404`, () => {
        const reservationId = 123456
        return supertest(app)
          .get(`/api/reservations/reservation/${reservationId}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(
            404, { error: `Reservation doesn't exist` }
          )
      })
    })

    context('Given there are reservations in the database', () => {
      beforeEach('insert reservations', () =>
        helpers.seedReservations(
          db,
          testProperties,
          testReservations
        )
      )

      it('responds with 200 and details about reservation', () => {
        const testReservation = testReservations[0]
        const expectedReservationDetails = helpers.makeExpectedReservationDetails(testUsers, testReservation)

        return supertest(app)
          .get(`/api/reservations/reservation/${testReservation.id}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200, expectedReservationDetails)
      })
    })

    // context(`Given an XSS attack reservation`, () => {
    //   const testProperty = testProperties.find(p => p.user_id === testUser.id)

    //   beforeEach('insert properties', () =>
    //     helpers.seedProperties(
    //       db,
    //       testProperties
    //     )
    //   )

    //   const {
    //     maliciousReservation,
    //     expectedReservation,
    //   } = helpers.makeMaliciousReservation(testUser, testProperty)

    //   beforeEach('insert malicious reservation', () => {
    //     return helpers.seedMaliciousReservation(
    //       db,
    //       maliciousReservation,
    //     )
    //   })

    //   it('removes XSS attack content', () => {
    //     return supertest(app)
    //       .get(`/api/reservations/property/${testProperty.id}`)
    //       .set('Authorization', helpers.makeAuthHeader(testUser))
    //       .expect(200)
    //       .expect(res => {
    //         expect(res.body[0].title).to.eql(expectedReservation.title)
    //       })
    //   })
    // })
  })

  describe(`POST /api/reservations`, () => {
    const testUsers = helpers.makeUsersArray()
    const testUser = testUsers[0]
    const testProperties = helpers.makePropertiesArray(testUsers)
    // const testReservations = helpers.makeReservationsArray(testUsers, testProperties)

    beforeEach(() =>
      helpers.seedUsers(db, testUsers)
    )

    beforeEach(() =>
      helpers.seedProperties(db, testProperties)
    )


    it(`creates a reservation, responding with 201 and the new reservation`, function () {
      this.retries(3)

      const newReservation = {
        property_id: testProperties[0].id,
        user_id: testUser.id,
        title: 'New Test Reservation',
        all_day: true,
        start_date: '2029-01-22T16:28:32.615Z',
        end_date: '2029-02-22T16:28:32.615Z',
        date_created: new Date(),
      }

      return supertest(app)
        .post('/api/reservations')
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .send(newReservation)
        .expect(201)
        .expect(res => {
          expect(res.body).to.have.property('id')
          expect(res.body.property_id).to.eql(newReservation.property_id)
          expect(res.body.user_id).to.eql(testUser.id)
          expect(res.body.title).to.eql(newReservation.title)
          expect(res.headers.location).to.eql(`/api/reservations/${res.body.id}`)
          const expectedDate = new Date().toLocaleString('en', { timeZone: 'UTC' })
          const actualDate = new Date(res.body.date_created).toLocaleString()
          expect(actualDate).to.eql(expectedDate)
        })
        .expect(res =>
          db
            .from('estatecloud_reservations')
            .select('*')
            .where({ id: res.body.id })
            .first()
            .then(row => {
              expect(row.title).to.eql(newReservation.title)
              expect(row.property_id).to.eql(newReservation.property_id)
              expect(row.user_id).to.eql(newReservation.user_id)
              const expectedDate = new Date().toLocaleString('en', { timeZone: 'UTC' })
              const actualDate = new Date(row.date_created).toLocaleString()
              expect(actualDate).to.eql(expectedDate)
            })
        )
    })

    const requiredFields = ['title', 'property_id', 'start_date', 'end_date']

    requiredFields.forEach(field => {

      const newReservation = {
        property_id: testProperties[0].id,
        user_id: testUser.id,
        title: 'New Test Reservation',
        all_day: true,
        start_date: '2029-01-22T16:28:32.615Z',
        end_date: '2029-02-22T16:28:32.615Z',
        date_created: new Date(),
      }

      it(`responds with 400 and an error message when the '${field}' is missing`, () => {
        delete newReservation[field]

        return supertest(app)
          .post('/api/reservations')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .send(newReservation)
          .expect(
            400, {
              error: `Missing '${field}' in request body`,
            }
          )
      })

    })

  })

  describe(`GET /api/reservations`, () => {
    const testUsers = helpers.makeUsersArray()
    const testUser = testUsers[0]
    const testProperties = helpers.makePropertiesArray(testUsers)
    const testReservations = helpers.makeReservationsArray(testUsers, testProperties)

    beforeEach(() =>
      helpers.seedUsers(db, testUsers)
    )

    context(`Given no reservations`, () => {

      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/api/reservations')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200, [])
      })
    })

    context('Given there are reservations in the database', () => {
      beforeEach('insert reservations', () =>
        helpers.seedReservations(
          db,
          testProperties,
          testReservations
        )
      )

      it('responds with 200 and all of the reservations', () => {
        const expectedReservations = testReservations.map(reservation => {
          const { id, property_id, user_id, title, all_day, date_created } = reservation
          return {
            id, property_id, user_id, title, all_day, date_created,
            start: reservation.start_date,
            end: reservation.end_date,
          }
        })

        return supertest(app)
          .get('/api/reservations')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200, expectedReservations)
      })
    })

    // context(`Given an XSS attack article`, () => {
    //   const {
    //     maliciousProperty,
    //     expectedProperty,
    //   } = helpers.makeMaliciousProperty(testUser)

    //   beforeEach('insert malicious property', () => {
    //     return helpers.seedMaliciousProperty(
    //       db,
    //       maliciousProperty,
    //     )
    //   })

    //   it('removes XSS attack content', () => {
    //     return supertest(app)
    //       .get(`/api/reservations`)
    //       .set('Authorization', helpers.makeAuthHeader(testUser))
    //       .expect(200)
    //       .expect(res => {
    //         expect(res.body[0].address).to.eql(expectedProperty.address)
    //         expect(res.body[0].city).to.eql(expectedProperty.city)
    //       })
    //   })

    // })

  })

  describe('DELETE /reservations/:reservation_id', () => {
    const testUsers = helpers.makeUsersArray()
    const testUser = testUsers[0]
    const testProperties = helpers.makePropertiesArray(testUsers)
    const testReservations = helpers.makeReservationsArray(testUsers, testProperties)

    beforeEach(() =>
      helpers.seedUsers(db, testUsers)
    )

    context(`Given no reservations`, () => {
      it(`responds 404 whe reservation doesn't exist`, () => {
        return supertest(app)
          .delete(`/api/reservations/123`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(
            404, {
              error: { message: "Reservation doesn't exist" }
            }
          )
      })
    })

    context('Given there are reservations in the database', () => {

      beforeEach('insert reservations', () => helpers.seedReservations(db, testProperties, testReservations))

      it('removes the reservation by id and returns the id of deleted reservation', () => {
        const idToRemove = testReservations[0].id
        const expectedReservations = testReservations.filter(res => res.id !== idToRemove).map(filteredRes => {
          const { all_day, date_created, id, property_id, title, user_id } = filteredRes;
          return {
            all_day, date_created, id, property_id, title, user_id,
            start: filteredRes.start_date,
            end: filteredRes.end_date,
          }
        })

        return supertest(app)
          .delete(`/api/reservations/${idToRemove}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(202)
          .expect(res => res.body === idToRemove)
          .then(() =>
            supertest(app)
              .get(`/api/reservations`)
              .set('Authorization', helpers.makeAuthHeader(testUser))
              .expect(expectedReservations)
          )
      })
    })
  })

})
