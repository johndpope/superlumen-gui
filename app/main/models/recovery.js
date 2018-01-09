const Security = require('../util/security.js');
const Account = require('./account.js');

module.exports = class RecoveryModel {

    constructor() {

        /**
         * Holds the questions to be asked during recovery. These questions are not protected.
         * @type {Array.<String>}
         */
        this.questions = [];

        /**
         * Stores the answers to questionn as an array of the answers (strings).
         * @type {Array.<String>}
         */
        this.answers = [];

        /**
         * Stores account records as an array of the answers (strings).
         * @type {Array.<Account>}
         */
        this.accounts = [];

    }

}

/**
 * The minimum number of questions and answers required to retain a recovery record.
 * @type {Number}
 */
module.exports.MinQuestionsAnswers = 5;