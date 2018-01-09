const crypto = require('crypto');

module.exports = class Key {
    /**
     * @param {String|Buffer} password 
     */
    constructor(password) {
        if (!password) {
            throw new Error('The "password" argument is required.');
        } else if (typeof password !== 'string' && Buffer.isBuffer(password) === false) {
            throw new Error('The "password" argument must be a String or Buffer.');
        }

        this.iv = crypto.randomBytes(12);

        this.salt = crypto.randomBytes(64);

        this.value = crypto.pbkdf2Sync(password, this.salt, 2145, 32, 'sha512'); 
    }

}