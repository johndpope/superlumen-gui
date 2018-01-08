const WalletModel = require('../models/wallet.js');

/**
 * Wire is a base abstract class that closely interacts and runs operations over a Superlumen wallet and the Stellar
 * network.
 * @class
 */
module.exports = class Wire {
    /**
     * @constructor
     * @param {WalletModel} wallet 
     */
    constructor(wallet) {
        this.wallet = wallet;
    }

    /**
     * @callback Wire~callback
     * @param {Object} data
     * @param {String} data.op - The name of the operation that ran, usually the function name.
     * @param {Object|Array.<Object>} [data.model] - The model(s) object affected by the operation on the wallet.
     * @param {Boolean} data.found - Indicates whether the account is already present in the wallet.
     * @param {Array.<String>} [data.errors]
     */
}