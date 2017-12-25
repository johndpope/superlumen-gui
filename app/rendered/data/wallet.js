const fs = require('fs');
const crypto = require('crypto');

module.exports = class Wallet {

    constructor() {
        this.version = 0;
        this.salt = null;
        this.walletFilePath = null;
        this.password = null;
        this.keyFilePath = null;
        this.accounts = [];
        this.recovery = null;
    }

    setPassword(passwordPlainText) {
        if (!this.salt) {
            this.salt = crypto.randomBytes(Math.random() * (128 - 64) + 64).toString('base64');
        }
        let shasum = crypto.createHash('sha512');
        shasum.update(Buffer.concat([new Buffer(passwordPlainText, 'utf8'), this.salt]));
        this.password = shasum.digest('hex');
    }

    /**
     * Load and decrypt a given wallet file.
     * @param {String} password 
     * @param {String} keyFilePath 
     */
    load(walletFilePath, password, keyFilePath) {
        if (!walletFilePath) {
            throw new Error('The wallet file path is not specified.');
        } else if (!password) {
            throw new Error('A wallet password is required.');
        } else if (password instanceof SecureString === false) {
            throw new Error('Bad implementation. The wallet password must be a SecureString.');
        } else if (fs.existsSync(walletFilePath) === false) {
            throw new Error('The wallet file path specified does not exist or is inaccessible.');
        } else if (keyFilePath && fs.existsSync(keyFilePath) === false) {
            throw new Error('The key file path specified does not exist or is inaccessible.');
        }
        this.walletFilePath = walletFilePath;
        this.password = password;
        this.keyFilePath = keyFilePath;
        this.accounts = [];
    }

    /**
     * Saves the wallet.
     */
    save(filePath) {
        if (!this.walletFilePath) {
            throw new Error('The wallet file path is not specified.');
        } else if (!password) {
            throw new Error('A wallet password is required.');
        } else if (password instanceof SecureString === false) {
            throw new Error('Bad implementation. The wallet password must be a SecureString.');
        } else if (keyFilePath && fs.existsSync(keyFilePath) === false) {
            throw new Error('The key file path specified does not exist or is inaccessible.');
        }
        //TODO save
        this.walletFilePath = filePath ? filePath : this.walletFilePath;
    }

}