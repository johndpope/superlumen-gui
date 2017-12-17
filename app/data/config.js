var process = require('process');

module.exports = class Config {
    constructor() {
        this.development = !!process.env.SUPERLUMEN_ENV;
    }
}