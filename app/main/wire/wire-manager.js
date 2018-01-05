const Wallet = require('../data/wallet.js');
const Wire = require('./wire.js');
const AccountWire = require('./account-wire.js');

module.exports = class WireManager extends Wire {
    /**
     * @constructor
     * @param {Wallet} wallet 
     */
    constructor(wallet) {
        super(wallet);

        /**
         * @type {AccountWire}
         */
        this.accounts = null;

        //setup the wires
        this.wire(wallet);
    }

    /**
     * Sets the WireManager's wallet and initializes all default wires with the given wallet.
     * @param {Wallet} wallet
     */
    wire(wallet) {
        if (!wallet) {
            throw new Error('The "wallet" argument is required.');
        } else if (!wallet instanceof Wallet) {
            throw new Error('The "wallet" argument must be a Wallet type.');
        }
        this.wallet = wallet;
        //add wires
        this.accounts = new AccountWire(wallet);
        //all done
        return this;
    }

}