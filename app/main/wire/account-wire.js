const Stellar = require('stellar-base');
const Wire = require('./wire.js');
const Wallet = require('../data/wallet.js');
const Account = require('../data/account.js');
const Recovery = require('../data/recovery-record.js');

/**
 * Runs operations regarding accounts.
 * @class
 */
module.exports = class AccountWire extends Wire {
    /**
     * @constructor
     * @param {Wallet} wallet 
     */
    constructor(wallet) {
        super(wallet);
    }

    /**
     * @callback AccountWire~createCallback
     * @param {Stellar.Keypair} kp
     */

    /**
     * Creates a new Stellar account key-pair (public/private key).
     * @param {AccountWire~createCallback} [callback]
     */
    create(callback) {
        let kp = Stellar.Keypair.random();
        let account = new Account('My New Account', kp.publicKey(), kp.secret(), new Date());
        if (callback) {
            callback(account);
        }
        return account;
    }
}