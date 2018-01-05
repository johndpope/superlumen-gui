const Security = require('../util/security.js');
const Account = require('./account.js');

module.exports = class Recovery {

    constructor() {

        /**
         * Holds the questions to be asked during recovery. These questions are not protected.
         * @type {Array.<String>}
         */
        this.questions = [];

        /**
         * Stores the answers to questions. When locked, the entire array is encrypted using the wallet password and 
         * key-file (not the recovery answers themselves) as a string. When unlocked, this field is an array of the 
         * answers (strings).
         * @type {String|Array.<String>}
         */
        this.answers = [];

        /**
         * Stores account records. When locked, the entire array is encrypted using the recovery password as a hex 
         * string. When unlocked, this field is an array of the answers (strings).
         * @type {String|Array.<Account>}
         */
        this.accounts = [];

        /**
         * Indicates whether the recovery data (answers and accounts) has been unlocked or not.
         * @type {Boolean}
         */
        this.unlocked = true;
    }

    /**
     * Unlocks the recovery record by decrypting the accounts and answers.
     * @param {String|Buffer} recoveryPassword - The answers to the recovery questions, in order and joined, as a base64
     *                                           string or byte Buffer. 
     * @param {Buffer} walletPassword - The wallet's plaintext password + key file used to decrypt the answer array. 
     */
    unlock(recoveryPassword, walletPassword) {
        if (!recoveryPassword) {
            throw new Error('The "recoveryPassword" argument is required.');
        } else if (!Buffer.isBuffer(recoveryPassword) || !typeof recoveryPassword === 'string') {
            throw new Error('The "recoveryPassword" must be a string or Buffer.');
        } else if (!Buffer.isBuffer(walletPassword)) {
            throw new Error('The "walletPassword" must be a Buffer.');
        }
        if (this.unlocked) {
            return;
        }
        //decrypt accounts
        this.accounts = this.recoverAccounts(recoveryPassword);
        //decrypt answers
        if (typeof this.answers === 'string') {
            this.answers = Security.decrypt(this.answers, walletPassword);
        }
        this.unlocked = true;
    }

    /**
     * Decrypts the answers using the given recovery password and returns the array. This does not unlock the record.
     * If the recovery record is unlocked, then the answers array is returned instead of decrypting.
     * @param {String|Buffer} recoveryPassword - The answers to the recovery questions, in order and joined, as a base64
     *                                           string or byte Buffer. 
     * @returns {Array.<Account>}
     */
    recoverAccounts(recoveryPassword) {
        if (!recoveryPassword) {
            throw new Error('The "recoveryPassword" argument is required.');
        } else if (!Buffer.isBuffer(recoveryPassword) || !typeof recoveryPassword === 'string') {
            throw new Error('The "recoveryPassword" must be a string or Buffer.');
        }
        if (typeof this.accounts === 'string') {
            return Security.decrypt(this.accounts, recoveryPassword);
        }
        return this.accounts;
    }

    /**
     * Locks the recovery record by encrypting the accounts and answers.
     * @param {String|Buffer} recoveryPassword - The answers to the recovery questions, in order and joined, as a base64
     *                                           string or byte Buffer. 
     * @param {Buffer} walletPassword - The wallet's plaintext password + key file used to encrypt the answer array. 
     */
    lock(recoveryPassword, walletPassword) {
        if (!recoveryPassword) {
            throw new Error('The "recoveryPassword" argument is required.');
        } else if (!Buffer.isBuffer(recoveryPassword) || !typeof recoveryPassword === 'string') {
            throw new Error('The "recoveryPassword" must be a string or Buffer.');
        } else if (!Buffer.isBuffer(walletPassword)) {
            throw new Error('The "walletPassword" must be a Buffer.');
        }
        if (!this.unlocked) {
            return;
        }
        if (Array.isArray(this.accounts)) {
            this.accounts = Security.encrypt(this.accounts, recoveryPassword);
        }
        if (Array.isArray(this.answers)) {
            this.answers = Security.encrypt(this.answers, walletPassword);
        }
        this.unlocked = false;
    }

}