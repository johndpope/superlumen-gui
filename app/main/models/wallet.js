const fs = require('fs');
const crypto = require('crypto');
const RecoveryModel = require('./recovery.js');
const AccountModel = require('./account.js');

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
         * Holds the path of the wallet file when loaded and after saving.
         */
        this.walletFilePath = null;

        /**
         * Indicates whether the wallet has been unlocked or not.
         * @type {Boolean}
         */
        this.unlocked = true;
    }

    /**
     * Load and decrypt a given wallet file.
     * @param {String} password 
     * @param {String} keyFilePath 
     */
    load(walletFilePath, password, keyFilePath) {
        if (!walletFilePath) {
            throw new Error('The wallet file path is not specified.');
        } else if (!password) {
            throw new Error('A wallet password is required.');
        } else if (password instanceof SecureString === false) {
            throw new Error('Bad implementation. The wallet password must be a SecureString.');
        } else if (fs.existsSync(walletFilePath) === false) {
            throw new Error('The wallet file path specified does not exist or is inaccessible.');
        } else if (keyFilePath && fs.existsSync(keyFilePath) === false) {
            throw new Error('The key file path specified does not exist or is inaccessible.');
        }
        this.walletFilePath = walletFilePath;
        //TODO load
    }

    /**
     * Saves the wallet.
     */
    save(filePath) {
        if (!this.walletFilePath) {
            throw new Error('The wallet file path is not specified.');
        } else if (!password) {
            throw new Error('A wallet password is required.');
        } else if (password instanceof SecureString === false) {
            throw new Error('Bad implementation. The wallet password must be a SecureString.');
        } else if (keyFilePath && fs.existsSync(keyFilePath) === false) {
            throw new Error('The key file path specified does not exist or is inaccessible.');
        }
        //TODO save
        this.walletFilePath = filePath ? filePath : this.walletFilePath;
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