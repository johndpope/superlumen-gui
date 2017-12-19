var process = require('process');

module.exports = {

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
     * The theme applied.
     * @type {String} 
     */
    theme: 'dark'
    
}