const Wallet = require('../data/wallet.js');

/**
 * Wire is a base abstract class that closely interacts and runs operations over a Superlumen wallet and the Stellar
 * network.
 * @class
 */
module.exports = class Wire {
    /**
     * @constructor
     * @param {Wallet} wallet 
     */
    constructor(wallet) {
        this.wallet = wallet;
    }
}