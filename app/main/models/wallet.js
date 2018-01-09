const fs = require('fs');
const crypto = require('crypto');
const RecoveryModel = require('./recovery.js');
const AccountModel = require('./account.js');
const Key = require('./key.js');

module.exports = class WalletModel {
    constructor() {

        /**
         * Holds the Account objects. When locked, the entire array is encrypted using the wallet  password and 
         * key-file as a string. When unlocked, this field is an array of Accounts.
         * @type {String|Array.<AccountModel>}
         */
        this.accounts = [];

        /**
         * If a recovery record is present, it is stored in this field.
         * @type {RecoveryModel}
         */
        this.recovery = null;

        /**
         * The key used to encrypt the wallet.
         * @type {Key}
         */
        this.key = null;

        /**
         * A custom label for the wallet (shown on the dashboard).
         * @type {String}
         */
        this.label = 'My Wallet';

        /**
         * The date the wallet instance was created.
         * @type {Date}
         */
        this.dateCreated = new Date();

    }

    /**
     * Updates this wallet model with the information from another.
     * @param {WalletModel} source 
     */
    updateFrom(source) {
        if (!source) {
            errors.push('The "source" argument is required.');
        } else if (source instanceof WalletModel == false) {
            errors.push('The "source" argument must be a model type Wallet.');
        }
        this.label = source.label;
        this.dateCreated = source.dateCreated || new Date();
    }

}

/**
 * The minimum key file size allowed by Superlumen.
 * @type {Number}
 */
module.exports.MinKeyFileSize = 32;

/**
 * The maximum key file size allowed by Superlumen.
 * @type {Number}
 */
module.exports.MaxKeyFileSize = 1024 * 16;