const Wire = require('./wire.js');
const Config = require('../models/config.js');

/**
 * Provides operations to manipulate the application configuration.
 * @class
 */
module.exports = class ConfigWire extends Wire {
    /**
     * @constructor
     * @param {WalletModel} wallet 
     */
    constructor(wallet) {
        super(wallet);
    }

    /**
     * Returns the application configuration.
     * @param {Wire~callback} [callback]
     * @returns {Config}
     */
    read(callback) {
        if (callback) {
            callback({ op: 'read', model: Config, found: true });
        }
        return Config;
    }

}