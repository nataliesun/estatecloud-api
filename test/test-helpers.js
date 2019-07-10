const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

function makeUsersArray() {
  return [
    {
      id: 1,
      email: 'test-user-1@email.com',
      first_name: 'Test1',
      last_name: 'User1',
      password: 'password1',
      date_created: '2029-01-22T16:28:32.615Z',
    },
    {
      id: 2,
      email: 'test-user-2@email.com',
      first_name: 'Test2',
      last_name: 'User2',
      password: 'password2',
      date_created: '2029-01-22T16:28:32.615Z',
    },
    {
      id: 3,
      email: 'test-user-3@email.com',
      first_name: 'Test3',
      last_name: 'User3',
      password: 'password3',
      date_created: '2029-01-22T16:28:32.615Z',
    },
    {
      id: 4,
      email: 'test-user-4@email.com',
      first_name: 'Test4',
      last_name: 'User4',
      password: 'password4',
      date_created: '2029-01-22T16:28:32.615Z',
    },
  ]
}

function makePropertiesArray(users) {
  return [
    {
      id: 1,
      address: '1 Test St',
      city: 'Testtown',
      state: 'CA',
      status: 'rented',
      rent_price: '1000',
      initial_price: '1000000',
      mortgage_payment: '500',
      date_created: '2029-01-22T16:28:32.615Z',
      user_id: users[0].id,
    },
    {
      id: 2,
      address: '2 Test St',
      city: 'Testtown',
      state: 'CA',
      status: 'rented',
      rent_price: '1000',
      initial_price: '1000000',
      mortgage_payment: '500',
      date_created: '2029-01-22T16:28:32.615Z',
      user_id: users[1].id,
    },
    {
      id: 3,
      address: '3 Test St',
      city: 'Testtown',
      state: 'CA',
      status: 'rented',
      rent_price: '1000',
      initial_price: '1000000',
      mortgage_payment: '500',
      date_created: '2029-01-22T16:28:32.615Z',
      user_id: users[2].id,
    },
    {
      id: 4,
      address: '4 Test St',
      city: 'Testtown',
      state: 'CA',
      status: 'rented',
      rent_price: '1000',
      initial_price: '1000000',
      mortgage_payment: '500',
      date_created: '2029-01-22T16:28:32.615Z',
      user_id: users[3].id,
    },
  ]
}

function makeReservationsArray(users, properties) {
  return [
    {
      id: 1,
      property_id: properties[0].id,
      user_id: users[0].id,
      title: 'Test Reservation 1',
      all_day: true,
      start_date: '2029-01-22T16:28:32.615Z',
      end_date: '2029-02-22T16:28:32.615Z',
      date_created: '2029-01-22T16:28:32.615Z',
    },
    {
      id: 2,
      property_id: properties[1].id,
      user_id: users[1].id,
      title: 'Test Reservation 2',
      all_day: true,
      start_date: '2029-01-22T16:28:32.615Z',
      end_date: '2029-02-22T16:28:32.615Z',
      date_created: '2029-01-22T16:28:32.615Z',
    },
    {
      id: 3,
      property_id: properties[2].id,
      user_id: users[2].id,
      title: 'Test Reservation 3',
      all_day: true,
      start_date: '2029-01-22T16:28:32.615Z',
      end_date: '2029-02-22T16:28:32.615Z',
      date_created: '2029-01-22T16:28:32.615Z',
    },
    {
      id: 4,
      property_id: properties[3].id,
      user_id: users[3].id,
      title: 'Test Reservation 4',
      all_day: true,
      start_date: '2029-01-22T16:28:32.615Z',
      end_date: '2029-02-22T16:28:32.615Z',
      date_created: '2029-01-22T16:28:32.615Z',
    },
  ];
}

function makeExpectedProperties(user, properties) {
  const userProperties = properties.filter(property => property.user_id === user.id)


  return userProperties.map(property => {
    return {
      id: property.id,
      address: property.address,
      city: property.city,
      state: property.state,
      date_created: property.date_created,
      status: property.status,
      rent_price: parseInt(property.rent_price),
      initial_price: parseInt(property.initial_price),
      mortgage_payment: parseInt(property.mortgage_payment),
      user_id: property.user_id
    }
  })
}

function makeExpectedThingReviews(users, thingId, reviews) {
  const expectedReviews = reviews
    .filter(review => review.thing_id === thingId)

  return expectedReviews.map(review => {
    const reviewUser = users.find(user => user.id === review.user_id)
    return {
      id: review.id,
      text: review.text,
      rating: review.rating,
      date_created: review.date_created,
      user: {
        id: reviewUser.id,
        user_name: reviewUser.user_name,
        full_name: reviewUser.full_name,
        nickname: reviewUser.nickname,
        date_created: reviewUser.date_created,
      }
    }
  })
}

function makeMaliciousProperty(user) {
  const maliciousProperty = {
    id: 911,
    address: 'Naughty naughty very naughty <script>alert("xss");</script>',
    city: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
    state: 'CA',
    date_created: new Date().toISOString(),
    status: 'available',
    rent_price: 1231,
    initial_price: 987213,
    mortgage_payment: 1000,
    user_id: user.id
  }
  const expectedProperty = {
    ...makeExpectedProperties(user, [maliciousProperty])[0],
    address: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
    city: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`,
  }
  return {
    maliciousProperty,
    expectedProperty,
  }
}

function makeThingsFixtures() {
  const testUsers = makeUsersArray()
  const testThings = makeThingsArray(testUsers)
  const testReviews = makeReviewsArray(testUsers, testThings)
  return { testUsers, testThings, testReviews }
}

function cleanTables(db) {
  return db.raw(
    `TRUNCATE
      estatecloud_users,
      estatecloud_properties,
      estatecloud_reservations
      RESTART IDENTITY CASCADE`
  )
}

function seedUsers(db, users) {
  const preppedUsers = users.map(user => ({
    ...user,
    password: bcrypt.hashSync(user.password, 1)
  }))
  return db.into('estatecloud_users').insert(preppedUsers)
    .then(() =>
      // update the auto sequence to stay in sync
      db.raw(
        `SELECT setval('estatecloud_users_id_seq', ?)`,
        [users[users.length - 1].id],
      )
    )
}

function seedMaliciousProperty(db, property) {
  return db
    .into('estatecloud_properties')
    .insert(property)
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ email: user.email }, secret, {
    subject: user.email,
    algorithm: 'HS256',
  })
  return `Bearer ${token}`
}

function seedProperties(db, properties) {
  return db
    .into('estatecloud_properties')
    .insert(properties)
}

function seedReservations(db, properties, reservations = []) {
  // use a transaction to group the queries and auto rollback on any failure
  return db.transaction(async trx => {
    // await trx.into('estatecloud_users').insert(users)
    await trx.into('estatecloud_properties').insert(properties)
    // update the auto sequence to match the forced id values
    await Promise.all([
      // trx.raw(
      //   `SELECT setval('estatecloud_users_id_seq', ?)`,
      //   [users[users.length - 1].id],
      // ),
      trx.raw(
        `SELECT setval('estatecloud_properties_id_seq', ?)`,
        [properties[properties.length - 1].id],
      ),
    ])
    // only insert reservations if there are some, also update the sequence counter
    if (reservations.length) {
      await trx.into('estatecloud_reservations').insert(reservations)
      await trx.raw(
        `SELECT setval('estatecloud_reservations_id_seq', ?)`,
        [reservations[reservations.length - 1].id],
      )
    }
  })
}


function makeExpectedReservationCount(user, properties, reservations) {
  const count = {
    owned: null,
    made: null
  }

  count.made = reservations.filter(reservation => reservation.user_id === user.id).length

  const propertyIds = properties.filter(property => property.user_id === user.id).map(p => p.id)

  count.owned = reservations.filter(reservation => propertyIds.includes(reservation.property_id)).length

  return count
}

function makeMaliciousReservation(user, property) {
  const maliciousReservation = {
    id: 911,
    user_id: user.id,
    title: 'Naughty naughty very naughty <script>alert("xss");</script>',
    start_date: new Date().toISOString(),
    end_date: new Date().toISOString(),
    property_id: property.id
  }
  const expectedReservation = {
    ...makeExpectedReservationsForProperty(user, [maliciousReservation])[0],
    title: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
  }
  return {
    maliciousReservation,
    expectedReservation,
  }
}

function makeExpectedReservationsForProperty(propertyId, reservations) {
  return reservations.filter(reservation => reservation.property_id === propertyId)
    .map(filteredRes => {
      const { all_day, date_created, id, property_id, title, user_id } = filteredRes;
      return {
        all_day, date_created, id, property_id, title, user_id,
        start: filteredRes.start_date,
        end: filteredRes.end_date,
      }
    })
}

function seedMaliciousReservation(db, reservation) {
  return db
    .into('estatecloud_reservations')
    .insert(reservation)
}

function makeExpectedReservationDetails(users, reservation) {
  const user = users.find(u => u.id === reservation.user_id)

  return {
    res_user: reservation.user_id,
    res_id: reservation.id,
    first_name: user.first_name,
    last_name: user.last_name,
    date_created: reservation.date_created
  }

}

function makeExpectedPropertiesForFriend(id, properties) {
  return properties.filter(p => p.user_id === id).map(filteredP => {
    return {
      address: filteredP.address,
      id: filteredP.id
    }
  })
}

module.exports = {
  makeUsersArray,
  makePropertiesArray,
  makeReservationsArray,
  cleanTables,
  seedUsers,
  makeAuthHeader,
  seedProperties,
  makeExpectedProperties,
  makeMaliciousProperty,
  seedMaliciousProperty,
  seedReservations,
  makeExpectedReservationCount,
  makeMaliciousReservation,
  makeExpectedReservationsForProperty,
  seedMaliciousReservation,
  makeExpectedReservationDetails,
  makeExpectedPropertiesForFriend
}
