const fs = require('fs');
const SecureString = require('secure-string');

module.exports = class Wallet {

    constructor() {
        this.Version = 0;
        this.WalletFilePath = null;
        this.Password = null;
        this.KeyFilePath = null;
        this.Accounts = [];
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
        this.WalletFilePath = walletFilePath;
        this.Password = password;
        this.KeyFilePath = keyFilePath;
        this.Accounts = [];
        //decrypt the wallet
        password.value(plainText => {
            //load the key file if specified.
            if (keyFilePath) {
                var keyFileBuf = fs.readFileSync(keyFilePath);
            }
            plainText.toString();
            //TODO read
        });
    }

    /**
     * Saves the wallet.
     */
    save(walletFilePath) {
        if (!this.WalletFilePath) {
            throw new Error('The wallet file path is not specified.');
        } else if (!password) {
            throw new Error('A wallet password is required.');
        } else if (password instanceof SecureString === false) {
            throw new Error('Bad implementation. The wallet password must be a SecureString.');
        } else if (keyFilePath && fs.existsSync(keyFilePath) === false) {
            throw new Error('The key file path specified does not exist or is inaccessible.');
        }
        //TODO save
        this.WalletFilePath = walletFilePath;
    }

}