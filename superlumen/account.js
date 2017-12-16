const SecureString = require('secure-string');

module.exports = class Account {

    constructor(label, publicKey, privateKey, dateCreated) {
        if (privateKey && privateKey instanceof SecureString === false) {
            throw new Error('The "privateKey" argument must be a SecureString.');
        }

        this.Label = label || 'My New Wallet';
        this.PublicKey = publicKey || null;
        this.PrivateKey = privateKey || null;
        this.DateCreated = dateCreated || Date.now();
    }

}