
module.exports = class Account {
    /**
     * @constructor
     * @param {String} label 
     * @param {String} publicKey 
     * @param {String} privateKey 
     * @param {Date} [dateCreated]
     */
    constructor(label, publicKey, privateKey, dateCreated) {
        if (!label) {
            throw new Error('The "label" argument is required.');
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
        * @type {Date}
        */
        this.dateCreated = dateCreated || new Date();

    }

}