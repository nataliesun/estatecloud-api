const bcrypt = require('bcryptjs')
const xss = require('xss')

const REGEX_UPPER_LOWER_NUMBER_SPECIAL = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&])[\S]+/

const UsersService = {
    hasUserWithEmail(db, email) {
        return db('estatecloud_users')
            .where({ email })
            .first()
            .then(user => !!user)
    },
    insertUser(db, newUser) {
        return db
            .insert(newUser)
            .into('estatecloud_users')
            .returning('*')
            .then(([user]) => user)
    },
    getUserName(db, id) {
        return db
            .from('estatecloud_users')
            .select('first_name')
            .where({ id })
            .first()
    },
    validatePassword(password) {
        if (password.length < 8) {
            return 'Password be longer than 8 characters'
        }
        if (password.length > 72) {
            return 'Password be less than 72 characters'
        }
        if (password.startsWith(' ') || password.endsWith(' ')) {
            return 'Password must not start or end with empty spaces'
        }
        if (!REGEX_UPPER_LOWER_NUMBER_SPECIAL.test(password)) {
            return 'Password must contain one upper case, lower case, number and special character'
        }
        return null
    },
    hashPassword(password) {
        return bcrypt.hash(password, 12)
    },
    serializeUser(user) {
        return {
            id: user.id,
            first_name: xss(user.first_name),
            last_name: xss(user.last_name),
            date_created: (user.date_created),
            email: xss(user.email)
        }
    },
    deleteUserByEmail(db, email) {
        return db.from('estatecloud_users')
            .delete()
            .where('email', email)
            .returning('*')
    }
}

module.exports = UsersService