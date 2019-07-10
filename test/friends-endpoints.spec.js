const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')

describe('Friends Endpoints', function () {
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

    it('responds with 401 Unauthorized for GET /api/friends/:user_email', () => {
      return supertest(app)
        .get('/api/friends/:user_email')
        .expect(401, { error: 'Missing bearer token' })
    })

  })

  describe(`GET /api/friends/:user_email`, () => {
    const testUsers = helpers.makeUsersArray()
    const testUser = testUsers[0]
    const testProperties = helpers.makePropertiesArray(testUsers)

    beforeEach(() =>
      helpers.seedUsers(db, testUsers)
    )

    context(`Given no users in database with matching email`, () => {
      it(`responds with 404`, () => {
        const nonExistentEmail = 'i@dontexist.com'
        return supertest(app)
          .get(`/api/friends/${nonExistentEmail}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(
            404, { error: `Can't find user with email` }
          )
      })
    })

    context('Given there is a matching email in the database', () => {
      beforeEach('insert properties', () =>
        helpers.seedProperties(
          db,
          testProperties,
        )
      )

      it('responds with 200 and the properties from user email id', () => {
        const existingUser = testUsers[1]
        const expectedProperties = helpers.makeExpectedPropertiesForFriend(existingUser.id, testProperties)

        return supertest(app)
          .get(`/api/friends/${existingUser.email}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(
            200, expectedProperties
          )
      })
    })
  })



})