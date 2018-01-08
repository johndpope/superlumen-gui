const process = require('process');
const path = require('path');

/**
 * @typedef Config~Network
 * @property {String} label
 * @property {String} url
 */

 /**
  * @static
  */
module.exports = {

    /**
     * The path to the rendered templates.
     * @type {String}
     */
    templatePath: path.resolve(path.join(__dirname, '..', '..', 'rendered', 'templates')),

    /**
     * Indicates whether the application started in development mode.
     * @type {Boolean}
     * @default false
     */
    development: !!process.env.SUPERLUMEN_ENV,

    /**
     * The last wallet file loaded.
     * @type {String} 
     */
    lastFile: null,

    /**
     * The list of networks that may be selected for new accounts.
     * @type {Array.<Config~Network>}
     */
    networks: [
        { label: 'Live', url: 'https://horizon.stellar.org' },
        { label: 'Test', url: 'https://horizon-testnet.stellar.org', default: true }
    ],

    /**
     * The theme applied.
     * @type {String} 
     */
    theme: 'dark'

}