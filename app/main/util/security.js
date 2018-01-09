const fs = require('fs');
const crypto = require('crypto');
const Key = require('../models/key.js');

module.exports = class Security {

    /**
     * Creates a hash digest of the given plain-text using the given salt if provided and returns it as a base64 string.
     * @param {String|Buffer|Object} plainText - A string, buffer, or object (will be converted to JSON) that will be hashed to produce a digest.
     * @param {String|Buffer} [salt]
     * @returns Base64 hash digest of the plain-text and salt (optional).
     */
    static hash(plainText, salt) {
        let buf = null;
        if (Buffer.isBuffer(plainText)) {
            buf = plainText;
        } else if (typeof plainText === 'string') {
            buf = Buffer.from(plainText, 'utf8');
        } else if (typeof plainText === 'object') {
            buf = Buffer.from(JSON.stringify(plainText), 'utf8');
        } else {
            throw Error('The "plainText" argument must be a string of Buffer.');
        }
        if (salt) {
            if (Buffer.isBuffer(salt)) {
                buf = Buffer.concat([buf, salt]);
            } else if (typeof salt === 'string') {
                buf = Buffer.concat([buf, Buffer.from(salt, 'utf8')]);
            } else {
                throw Error('The "salt" argument must be a string of Buffer if provided.');
            }
        }
        let shasum = crypto.createHash('sha512');
        shasum.update(buf);
        return shasum.digest('base64');
    }

    /**
     * Encrypts the given data using the specified password.
     * @param {Object} data 
     * @param {String|Buffer} password 
     * @returns {String} Base64 encoded data in encrypted form.
     */
    static encrypt(data, password) {
        if (!password) {
            throw new Error('The "password" argument is required.');
        }
        let key = (password instanceof Key ? password : new Key(password));
        let version = Buffer.from([0x00, 0x01]); //version of the encrypted data, for future backwards-compatibilty
        let plainText = new Buffer(JSON.stringify(data), 'utf8');
        let cipher = crypto.createCipheriv('aes-256-gcm', key.value, key.iv);
        let encrypted = Buffer.concat([cipher.update(plainText), cipher.final()]);
        let tag = cipher.getAuthTag();
        return Buffer.concat([version, key.salt, key.iv, tag, encrypted]).toString('base64');
    }

    /**
     * Decrypts the given data from it's encrypted base64 representation.
     * @param {String} base64data 
     * @param {String|Buffer} password 
     * @returns {Object}
     */
    static decrypt(base64data, password) {
        if (typeof base64data === 'undefined') {
            throw new Error('The "base64data" argument must be null or a string.');
        } else if (base64data === null) {
            return null;
        } else if (typeof base64data !== 'string') {
            throw new Error('The "base64data" argument must be null or a string.');
        } else if (!password) {
            throw new Error('The "password" argument is required.');
        }
        let data = new Buffer(base64data, 'base64');
        //data slice to buffers
        let version = data.slice(0, 2);
        let salt = data.slice(2, 66);
        let iv = data.slice(66, 78);
        let tag = data.slice(78, 94);
        let text = data.slice(94);
        // derive key using; 32 byte key length
        let key = crypto.pbkdf2Sync(password, salt, 2145, 32, 'sha512');
        //decrypt
        let decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
        decipher.setAuthTag(tag);
        //decrypt and de-json
        let plainText = decipher.update(text, 'binary', 'utf8') + decipher.final('utf8');
        return JSON.parse(plainText);
    }

}