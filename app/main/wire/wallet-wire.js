const fs = require('fs');
const Wire = require('./wire.js');
const WalletModel = require('../models/wallet.js');
const Key = require('../models/key.js');

/**
 * Runs operations on the wallet.
 * @class
 */
module.exports = class WalletWire extends Wire {
    /**
     * @constructor
     * @param {WalletModel} wallet 
     */
    constructor(wallet) {
        super(wallet);
    }

    /**
    * @typedef WalletWire~BasicWalletModel
    * @property {String} label
    * @property {String} password
    * @property {String} keyFilePath
    * @property {DateCreated} dateCreated
    */

    /**
     * Saves the basic wallet information to the active wallet.
     * @param {WalletWire~BasicWalletModel} wallet
     * @param {Wire~callback} [callback]
     * @returns {WalletWire~BasicWalletModel}
     */
    save(wallet, callback) {
        let errors = [];
        //run validations
        if (!wallet) {
            errors.push('The "wallet" argument is required.');
        } else if (wallet.label && typeof wallet.label !== 'string') {
            errors.push('The "wallet.label" must be a String if provided.');
        } else if (wallet.keyFilePath) {
            if (fs.existsSync(wallet.keyFilePath) === false) {
                errors.push('The key file selected does not exist.');
            } else {
                let stats = fs.statSync(wallet.keyFilePath);
                if (stats.size > WalletModel.MaxKeyFileSize) {
                    errors.push(`The key file selected is too large (${Math.round(stats.size / 1024)}KB). The maximum is ${WalletModel.MaxKeyFileSize / 1024}KB.`);
                } else if (stats.size < WalletModel.MinKeyFileSize) {
                    errors.push(`The key file selected is too small (${Math.round(stats.size)} Bytes). The minimum is ${WalletModel.MinKeyFileSize} Bytes.`);
                }
            }
        }
        if (!callback && errors.length) { //no callback, do a standard error throw.
            throw new Error(errors.join(';\n'));
        }
        if (!errors.length) { //no validation errors
            this.wallet.label = wallet.label;
            //this.wallet.dateCreated //read-only
            //only update the wallet key if a password was given.
            if (wallet.password) {
                let pw = new Buffer(wallet.password, 'utf8');
                if (wallet.keyFilePath) {
                    let kfdata = fs.readFileSync(wallet.keyFilePath);
                    pw = Buffer.concat([pw, kfdata]);
                }
                this.wallet.key = new Key(pw);
            }
        }
        if (callback) {
            callback({ op: 'save', model: wallet, found: true, errors: errors });
        }
        return wallet;
    }

    /**
     * Returns the basic wallet information.
     * @param {Wire~callback} [callback]
     * @returns {WalletWire~BasicWalletModel}
     */
    read(callback) {
        let model = {
            label: this.wallet.label,
            dateCreated: this.wallet.dateCreated
        };
        if (callback) {
            callback({
                op: 'read', model: model, found: true
            });
        }
        return model;
    }

    /**
     * Clears the wallet of all data and resets it to it's initialized state.
     * @param {Wire~callback} [callback]
     * @returns {Boolean}
     */
    delete(callback) {
        this.wallet.accounts = [];
        this.wallet.dateCreated = new Date();
        this.wallet.key = null;
        this.wallet.label = 'My Wallet';
        this.wallet.recovery = null;
        if (callback) {
            callback({
                op: 'read', model: {
                    label: this.wallet.label,
                    dateCreated: this.wallet.dateCreated
                }, found: true
            });
        }
        return true;
    }

}