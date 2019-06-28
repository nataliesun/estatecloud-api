const xss = require('xss')

const FriendsService = {
  getPropertiesForFriend(db, email) {
    const id = db
      .from('estatecloud_users')
      .select('id')
      .where({ email })
      .first()

    return db
      .from('estatecloud_properties')
      .select('address', 'id')
      .where('user_id', id)

  },

}

module.exports = FriendsService