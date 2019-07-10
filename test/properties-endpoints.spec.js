const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')

describe('Properties Endpoints', function () {
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
    const testProperties = helpers.makePropertiesArray(testUsers)

    beforeEach('insert users', () => {
      return db
        .into('estatecloud_users')
        .insert(testUsers)
    })

    beforeEach('insert properties', () => {
      return db
        .into('estatecloud_properties')
        .insert(testProperties)
    })

    it('responds with 401 Unauthorized for GET /api/properties', () => {
      return supertest(app)
        .get('/api/properties')
        .expect(401, { error: 'Missing bearer token' })
    })

    it(`responds with 401 Unauthorized for POST /api/properties`, () => {
      return supertest(app)
        .post('/api/properties')
        .send({
          address: 'Fake Test St',
          city: 'Testtown',
          state: 'CA',
          status: 'rented',
          rent_price: '1000',
          initial_price: '1000000',
          mortgage_payment: '500',
          date_created: '2029-01-22T16:28:32.615Z',
          user_id: testUsers[1].id,
        })
        .expect(401, { error: 'Missing bearer token' })
    })

    it(`responds with 401 Unauthorized for GET /api/properties/:property_id`, () => {
      const secondProperty = testProperties[1]
      return supertest(app)
        .get(`/api/properties/${secondProperty.id}`)
        .expect(401, { error: 'Missing bearer token' })
    })

    it(`responds with 401 Unauthorized for PATCH /api/properties/:property_id`, () => {
      const secondProperty = testProperties[1]
      return supertest(app)
        .patch(`/api/properties/${secondProperty.id}`)
        .expect(401, { error: 'Missing bearer token' })
    })

    it(`responds with 401 Unauthorized for DELETE /api/properties/:property_id`, () => {
      const aProperty = testProperties[1]
      return supertest(app)
        .delete(`/api/properties/${aProperty.id}`)
        .expect(401, { error: 'Missing bearer token' })
    })
  })

  describe(`GET /api/properties`, () => {
    const testUsers = helpers.makeUsersArray()
    const testUser = testUsers[0]
    const testProperties = helpers.makePropertiesArray(testUsers)

    beforeEach(() =>
      helpers.seedUsers(db, testUsers)
    )

    context(`Given no properties`, () => {

      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/api/properties')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200, [])
      })
    })

    context('Given there are properties in the database', () => {
      beforeEach('insert properties', () =>
        helpers.seedProperties(
          db,
          testProperties,
        )
      )

      it('responds with 200 and all of the properties', () => {
        const expectedProperties = helpers.makeExpectedProperties(testUser, testProperties)

        return supertest(app)
          .get('/api/properties')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200, expectedProperties)
      })
    })

    context(`Given an XSS attack article`, () => {
      const {
        maliciousProperty,
        expectedProperty,
      } = helpers.makeMaliciousProperty(testUser)

      beforeEach('insert malicious property', () => {
        return helpers.seedMaliciousProperty(
          db,
          maliciousProperty,
        )
      })

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/properties`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200)
          .expect(res => {
            expect(res.body[0].address).to.eql(expectedProperty.address)
            expect(res.body[0].city).to.eql(expectedProperty.city)
          })
      })
    })

  })

  describe(`GET /api/properties/:property_id`, () => {

    const testUsers = helpers.makeUsersArray()
    const testUser = testUsers[0]
    const testProperties = helpers.makePropertiesArray(testUsers)

    beforeEach(() =>
      helpers.seedUsers(db, testUsers)
    )

    context(`Given no properties`, () => {
      it(`responds with 404`, () => {
        const propertyId = 123456
        return supertest(app)
          .get(`/api/properties/${propertyId}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(
            404, { error: `Property doesn't exist` }
          )
      })
    })

    context('Given there are properties in the database', () => {
      beforeEach('insert properties', () =>
        helpers.seedProperties(
          db,
          testProperties,
        )
      )

      it('responds with 200 and the specified property', () => {
        const propertyId = 2
        const expectedProperty = {
          id: 2,
          address: '2 Test St',
          city: 'Testtown',
          state: 'CA',
          status: 'rented',
          rent_price: 1000,
          initial_price: 1000000,
          mortgage_payment: 500,
          date_created: '2029-01-22T16:28:32.615Z',
          user_id: 2
        }

        return supertest(app)
          .get(`/api/properties/${propertyId}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200, expectedProperty)
      })
    })

    context(`Given an XSS attack article`, () => {
      const testUser = helpers.makeUsersArray()[1]
      const {
        maliciousProperty,
        expectedProperty,
      } = helpers.makeMaliciousProperty(testUser)

      beforeEach('insert malicious property', () => {
        return helpers.seedMaliciousProperty(
          db,
          maliciousProperty,
        )
      })

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/properties/${expectedProperty.id}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200)
          .expect(res => {
            expect(res.body.address).to.eql(expectedProperty.address)
            expect(res.body.city).to.eql(expectedProperty.city)
          })
      })
    })
  })



})
