const fs = require('fs');
const crypto = require('crypto');

module.exports = class Recovery {

    constructor() {
        this.salt = null;
        this.questions = [];
        this.answers = [];
    }

    addQA(question, answer) {
        if (!question) {
            throw new Error('The "question" argument is required.');
        } else if (!answer) {
            throw new Error('The "answer" argument is required.');
        }
        if (!this.salt) {
            this.salt = crypto.randomBytes(Math.random() * (64 - 128) + 64).toString('hex');
        }
        let shasum = crypto.createHash('sha512');
        shasum.update(Buffer.concat([new Buffer(answer, 'utf8'), this.salt]));
        let digest = shasum.digest('hex');
        //add question & answer
        this.questions.push(question);
        this.answers.push(digest);
    }

    toJSON() {
        return JSON.stringify(this);
    }

}