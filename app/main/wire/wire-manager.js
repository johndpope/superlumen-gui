const Comm = require('../util/comm.js');
const WalletModel = require('../models/wallet.js');
const Wire = require('./wire.js');
const AccountWire = require('./account-wire.js');
const ConfigWire = require('./config-wire.js');
const RecoveryWire = require('./recovery-wire.js');

module.exports = class WireManager extends Wire {
    /**
     * @constructor
     * @param {WalletModel} wallet 
     */
    constructor(wallet) {
        super(wallet);

        /**
         * @type {AccountWire}
         */
        this.accounts = null;

        /**
         * @type {ConfigWire}
         */
        this.config = null;

        /**
         * @type {RecoveryWire}
         */
        this.recovery = null;

        //setup the wires
        this.wire(wallet);
    }

    /**
     * Sets the WireManager's wallet and initializes all default wires with the given wallet.
     * @param {WalletModel} wallet
     */
    wire(wallet) {
        if (!wallet) {
            throw new Error('The "wallet" argument is required.');
        } else if (!wallet instanceof WalletModel) {
            throw new Error('The "wallet" argument must be a Wallet type.');
        }
        this.wallet = wallet;
        //add wires
        this.accounts = new AccountWire(wallet);
        this.config = new ConfigWire(wallet);
        this.recovery = new RecoveryWire(wallet);
        //all done
        return this;
    }

    /**
     * Routes a comm message argument meant for making an active wire call.
     * @param {Comm~CommMessage} msg 
     */
    route(msg) {
        if (msg.arg && msg.arg.path && this.wallet && this.wire) {
            let comps = msg.arg.path.split('.');
            if (comps && comps.length) {
                let index = 0;
                let w = this; //wire manager instance
                while (index < comps.length - 1) {
                    w = w[comps[index]];
                    index++;
                }
                let f = w[comps[index]];
                if (typeof w === 'object' && typeof f === 'function') {
                    let fargs = [];
                    if (typeof msg.arg.args !== 'undefined') {
                        if (Array.isArray(msg.arg.args)) {
                            fargs = msg.arg.args;
                        } else {
                            fargs = [msg.arg.args];
                        }
                    }
                    //all wire calls should have a callback as the last argument and handle optional arguments before.
                    fargs.push(function (data) {
                        Comm.respond(msg, data); //send the resulting data from the wire call
                    });
                    //make the wire call
                    let data = f.apply(w, fargs);
                } else {
                    throw new Error('Wire chain failed to produce an object and function.');
                }
            }
        }
    }

}