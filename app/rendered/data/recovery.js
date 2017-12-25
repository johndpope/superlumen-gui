const fs = require('fs');
const crypto = require('crypto');

module.exports = class Recovery {

    constructor() {
        this.salt = null;
        this.questions = [];
        this.answers = [];
    }

    /**
     * Adds a question and answer (plaintext) to the recovery record. The answer is hashed.
     * @param {String} question 
     * @param {String} answer 
     */
    addQA(question, answer) {
        if (!question) {
            throw new Error('The "question" argument is required.');
        } else if (!answer) {
            throw new Error('The "answer" argument is required.');
        }
        if (!this.salt) {
            this.salt = crypto.randomBytes(Math.random() * (128 - 64) + 64).toString('base64');
        }
        let shasum = crypto.createHash('sha512');
        shasum.update(Buffer.concat([new Buffer(answer, 'utf8'), this.salt]));
        let digest = shasum.digest('hex');
        //add question & answer
        this.questions.push(question);
        this.answers.push(digest);
    }

    /**
     * Removes the existing questions and answers and resets the hash salt.
     */
    clear() {
        this.salt = null;
        this.questions.length = 0;
        this.answers.length = 0;
    }

    toJSON() {
        return JSON.stringify(this);
    }

}