
module.exports = class AccountModel {
    /**
     * @constructor
     * @param {String} label 
     * @param {String} publicKey 
     * @param {String} privateKey 
     * @param {Date} [dateCreated]
     */
    constructor(label, network, publicKey, privateKey, dateCreated) {
        if (!label) {
            throw new Error('The "label" argument is required.');
        } else if (!network) {
            throw new Error('The "network" argument is required.');
        } else if (!network.label) {
            throw new Error('The "network" argument requires a label.');
        } else if (!network.url) {
            throw new Error('The "network" argument requires a URL.');
        } else if (!publicKey) {
            throw new Error('The "publicKey" argument is required.');
        } else if (!privateKey) {
            throw new Error('The "privateKey" argument is required.');
        }

        /**
         * @type {String}
         */
        this.label = label || 'My New Wallet';

        /**
        * @type {String}
        */
        this.publicKey = publicKey || null;

        /**
        * @type {String}
        */
        this.privateKey = privateKey || null;

        /**
         * @type {Config~Network}
         */
        this.network = null;

        /**
        * @type {Date}
        */
        this.dateCreated = dateCreated || new Date();

    }

    /**
     * Updates this account model with the information from another.
     * @param {AccountModel} source 
     */
    updateFrom(source) {
        if (!source) {
            errors.push('The "source" argument is required.');
        } else if (source instanceof AccountModel == false) {
            errors.push('The "source" argument must be a model type Account.');
        }
        this.label = source.label;
        this.publicKey = source.publicKey;
        this.privateKey = source.privateKey;
        this.network = source.url;
        this.dateCreated = source.dateCreated || new Date();
    }

}