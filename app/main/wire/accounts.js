const Stellar = require('stellar-base');
const Wire = require('./wire.js');
const Wallet = require('../data/wallet.js');
const Account = require('../data/account.js');
const Recovery = require('../data/recovery-record.js');

/**
 * Runs operations regarding accounts.
 * @class
 */
module.exports = class WireAccounts extends Wire {
    /**
     * @constructor
     * @param {Wallet} wallet 
     */
    constructor(wallet) {
        super(wallet);
    }

    create(callback) {
        let kp = Stellar.Keypair.random();
    }
}