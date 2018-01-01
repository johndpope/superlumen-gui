const fs = require('fs');
const crypto = require('crypto');
const Account = require('./account.js');

module.exports = class Recovery {

    constructor() {

        /**
         * @type {String}
         */
        this.salt = null;

        /**
         * Holds the questions to be asked during recovery. These questions are not protected.
         * @type {Array.<String>}
         */
        this.questions = [];

        /**
         * Stores the answers to questions. When locked, the entire array is encrypted using the wallet password and 
         * key (not the recovery answers themselves) as a hex string. When unlocked, this field is an array of the 
         * answers (strings).
         * @type {String|Array.<String>}
         */
        this.answers = [];

        /**
         * The hash digest of the recovery answers concatenated + salt. Used for valid answer verification before 
         * attempting to decrypt the account information.
         * @type {String}
         */
        this.password = null;

        /**
         * Stores account records. When locked, the entire array is encrypted using the recovery password as a hex string. When unlocked, this field is an array of the 
         * answers (strings).
         * @type {String|Array.<Account>}
         */
        this.accounts = [];

        /**
         * Indicates whether the recovery data (answers and accounts) has been unlocked or not.
         * @type {Boolean}
         */
        this.unlocked = false;
    }

    /**
     * Updates the password digest on this recovery model based on the plaintext answers in the answers array.
     */
    updatePassword() {
        if (!this.salt) {
            this.salt = crypto.randomBytes(Math.round(Math.random() * (128 - 64) + 64)).toString('base64');
        }
        let shasum = crypto.createHash('sha512');
        shasum.update(Buffer.concat([new Buffer(this.answers.join(''), 'utf8'), new Buffer(this.salt, 'base64')]));
        this.password = shasum.digest('hex');
    }

    toJSON() {
        return JSON.stringify(this);
    }

}