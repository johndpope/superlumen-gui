const process = require('process');
const path = require('path');


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
     * The theme applied.
     * @type {String} 
     */
    theme: 'dark'
    
}