const Stellar = require('stellar-base');
const Wire = require('./wire.js');
const Config = require('../models/config.js');
const WalletModel = require('../models/wallet.js');
const AccountModel = require('../models/account.js');
const RecoveryModel = require('../models/recovery.js');

/**
 * Runs operations regarding accounts.
 * @class
 */
module.exports = class AccountWire extends Wire {
    /**
     * @constructor
     * @param {WalletModel} wallet 
     */
    constructor(wallet) {
        super(wallet);
    }

    /**
     * Creates a new Stellar account key-pair (public/private key) but does not actually add it to the wallet.
     * @param {Wire~callback} [callback]
     * @returns {AccountModel}
     */
    gen(callback) {
        let kp = Stellar.Keypair.random();
        let defNetwork = Config.networks.find((n)=>{
            return !!n.default;
        });
        if (!defNetwork) {
            defNetwork = Config.networks[0];
        }
        let account = new AccountModel('My New Account', defNetwork, kp.publicKey(), kp.secret(), new Date());
        if (callback) {
            callback({ op: 'gen', model: account, found: false });
        }
        return account;
    }

    /**
     * Saves an account model to the wallet by adding it if not present, or updating it if already present.
     * @param {AccountModel} account
     * @param {Wire~callback} [callback]
     * @returns {AccountModel}
     */
    save(account, callback) {
        let errors = [];
        let found = false;
        //run validations
        if (!account) {
            errors.push('The "account" argument is required.');
        } else if (account instanceof AccountModel == false) {
            errors.push('The "account" argument must be a model type Account.');
        } else if (this.wallet.unlocked === false) {
            errors.push('The wallet is locked and cannot be updated.');
        } else if (this.wallet.recovery && this.wallet.recovery.unlocked === false) {
            errors.push('The wallet recovery model is locked and cannot be updated.');
        } else if (!account.label) {
            errors.push('The "account.label" argument is required.');
        } else if (!account.network) {
            errors.push('The "account.network" argument is required.');
        } else if (!account.network.label) {
            errors.push('The "account.network" argument requires a label.');
        } else if (!account.network.url) {
            errors.push('The "account.network" argument requires a URL.');
        } else if (!account.publicKey) {
            errors.push('The "account.publicKey" argument is required.');
        } else if (!account.privateKey) {
            errors.push('The "account.privateKey" argument is required.');
        }
        if (!callback && errors.length) { //no callback, do a standard error throw
            throw new Error(errors.join(';\n'));
        }
        if (!errors.length) { //no validation errors
            //update wallet
            let existing = this.wallet.accounts.find((a) => {
                return a.publicKey === account.publicKey;
            });
            if (existing) { //update
                found = true;
                existing.updateFrom(account);
            } else { //add
                this.wallet.accounts.push(account);
            }
            //update wallet recovery
            if (this.wallet.recovery) {
                existing = this.wallet.recovery.accounts.find((a) => {
                    return a.publicKey === account.publicKey;
                });
                if (existing) { //update
                    existing.updateFrom(account);
                } else { //add
                    this.wallet.recovery.accounts.push(account);
                }
            }
        }
        if (callback) {
            callback({ op: 'save', model: account, found: found, errors: errors });
        }
        return account;
    }

    /**
     * Finds the account with the public key and returns it, or if omitted, returns all accounts in the wallet.
     * @param {String} [publicKey]
     * @param {Wire~callback} [callback]
     * @returns {AccountModel|Array.<AccountModel>}
     */
    read(publicKey, callback) {
        let errors = [];
        let models = null;
        if (publicKey && (typeof publicKey !== 'string' || (!callback && typeof publicKey !== 'function'))) {
            errors.push('The "publicKey" argument, if provided with a callback, must be a string.');
        } else if (this.wallet.unlocked === false) {
            errors.push('The wallet is locked and cannot be read.');
        }
        if (!callback && errors.length) { //no callback, do a standard error throw
            throw new Error(errors.join(';\n'));
        }
        if (!callback && typeof publicKey === 'function') {
            publicKey = null;
            callback = publicKey;
        }
        if (!errors.length) { //no validation errors
            if (publicKey) {
                models = this.wallet.accounts.find((a) => {
                    return a.publicKey === publicKey;
                });
            } else {
                models = this.wallet.accounts;
            }
        }
        if (callback) {
            callback({ op: 'read', model: models, found: !!models, errors: errors });
        }
        return models;
    }

    /**
     * Removes an account from the wallet.
     * @param {AccountModel|String} account - The account object or public key.
     * @param {Wire~callback} [callback]
     * @returns {Boolean}
     */
    delete(account, callback) {
        let errors = [];
        let found = false;
        //run validations
        if (!account) {
            errors.push('The "account" argument is required.');
        } else if (typeof account !== 'string' && account instanceof AccountModel == false) {
            errors.push('The "account" argument must be a model type Account or the public key string.');
        } else if (this.wallet.unlocked === false) {
            errors.push('The wallet is locked and cannot be updated.');
        } else if (this.wallet.recovery && this.wallet.recovery.unlocked === false) {
            errors.push('The wallet recovery model is locked and cannot be updated.');
        }
        if (!callback && errors.length) { //no callback, do a standard error throw
            throw new Error(errors.join(';\n'));
        }
        if (!errors.length) { //no validation errors
            //delete from the wallet.
            let index = this.wallet.accounts.findIndex((a) => {
                return a.publicKey === account.publicKey;
            });
            if (index > -1) {
                found = true;
                this.wallet.accounts.splice(index, 1);
            }
            //delete from wallet recovery
            if (this.wallet.recovery) {
                index = this.wallet.recovery.accounts.findIndex((a) => {
                    return a.publicKey === account.publicKey;
                });
                if (index > -1) {
                    this.wallet.recovery.accounts.splice(index, 1);
                }
            }
        }
        if (callback) {
            callback({ op: 'delete', model: account, found: found, errors: errors });
        }
        return found;
    }

}