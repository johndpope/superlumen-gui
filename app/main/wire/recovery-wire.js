const Wire = require('./wire.js');
const WalletModel = require('../models/wallet.js');
const AccountModel = require('../models/account.js');
const RecoveryModel = require('../models/recovery.js');

/**
 * Runs operations regarding the wallet's recovery record.
 * @class
 */
module.exports = class RecoveryWire extends Wire {
    /**
     * @constructor
     * @param {WalletModel} wallet 
     */
    constructor(wallet) {
        super(wallet);
    }

    /**
     * @typedef RecoveryWire~RecoveryQAModel
     * @property {Array.<String>} questions
     * @property {Array.<String>} answers
     */

    /**
     * Creates a new recovery record but does not actually add it to the wallet.
     * @param {Wire~callback} [callback]
     * @returns {RecoveryWire~RecoveryQAModel}
     */
    gen(callback) {
        //we dont actually pass the lockable recovery model the consumer, we use a proxy object instead.
        let model = {
            questions: [],
            answers: []
        };
        if (callback) {
            callback({ op: 'gen', model: model, found: false });
        }
        return model;
    }

    /**
     * Saves an recovery QA model to the wallet by adding it if not present, or updating it if already present.
     * @param {RecoveryWire~RecoveryQAModel} recovery
     * @param {Wire~callback} [callback]
     * @returns {RecoveryWire~RecoveryQAModel}
     */
    save(recovery, callback) {
        let errors = [];
        let found = false;
        //run validations
        if (!recovery) {
            errors.push('The "recovery" argument is required.');
        } else if (!recovery.questions || !recovery.answers || !Array.isArray(recovery.questions) || !Array.isArray(recovery.answers)) {
            errors.push('The "recovery" argument must be an object with an array of questions and an array of answers.');
        } else if (recovery.answers.length !== recovery.questions.length) {
            errors.push('There must be an equal number of questions and answers in the recovery record.');
        } else if (recovery.answers.length < RecoveryModel.MinQuestionsAnswers) {
            errors.push(`The recovery record requires at least ${RecoveryModel.MinQuestionsAnswers} questions and answers.`);
        } else if (this.wallet.unlocked === false) {
            errors.push('The wallet is locked and cannot be updated.');
        } else if (this.wallet.recovery && this.wallet.recovery.unlocked === false) {
            errors.push('The wallet recovery model is locked and cannot be updated.');
        }
        if (!callback && errors.length) { //no callback, do a standard error throw
            throw new Error(errors.join(';\n'));
        }
        if (!errors.length) { //no validation errors
            if (this.wallet.recovery) {
                found = true;
            } else { //create new recovery model
                let rm = new RecoveryModel();
                //clone the accounts from the wallet
                rm.accounts = [];
                for (let x = 0; x < this.wallet.accounts.length; x++) {
                    let a = new AccountModel();
                    a.updateFrom(this.wallet.accounts[x]);
                    rm.accounts.push(a);
                }
                this.wallet.recovery = rm;
            }
            //update the questions and answers
            this.wallet.recovery.questions = recovery.questions;
            this.wallet.recovery.answers = recovery.answers;
        }
        if (callback) {
            callback({ op: 'save', model: recovery, found: found, errors: errors });
        }
        return recovery;
    }

    /**
     * Returns the recovery QA (if any) on the wallet.
     * @param {Wire~callback} [callback]
     * @returns {RecoveryModel}
     */
    read(callback) {
        let errors = [];
        let model = null;
        let found = false;
        //run validations
        if (this.wallet.unlocked === false) {
            errors.push('The wallet is locked and cannot be updated.');
        } else if (this.wallet.recovery && this.wallet.recovery.unlocked === false) {
            errors.push('The wallet recovery model is locked and cannot be updated.');
        }
        if (!callback && errors.length) { //no callback, do a standard error throw
            throw new Error(errors.join(';\n'));
        }
        if (!errors.length) {
            if (this.wallet.recovery) {
                found = true;
                model = {
                    questions: this.wallet.recovery.questions,
                    answers: this.wallet.recovery.answers
                };
            }
        }
        if (callback) {
            callback({ op: 'read', model: model, found: found, errors: errors });
        }
        return this.wallet;
    }

    /**
     * Removes the recovery record from the wallet.
     * @param {Wire~callback} [callback]
     * @returns {Boolean}
     */
    delete(callback) {
        let errors = [];
        let found = false;
        let model = null;
        //run validations
        if (this.wallet.unlocked === false) {
            errors.push('The wallet is locked and cannot be updated.');
        } else if (this.wallet.recovery && this.wallet.recovery.unlocked === false) {
            errors.push('The wallet recovery model is locked and cannot be updated.');
        }
        if (!callback && errors.length) { //no callback, do a standard error throw
            throw new Error(errors.join(';\n'));
        }
        if (!errors.length) { //no validation errors
            if (this.wallet.recovery) {
                found = true;
                model = {
                    questions: this.wallet.recovery.questions,
                    answers: this.wallet.recovery.answers
                };
                this.wallet.recovery = null;
            }
        }
        if (callback) {
            callback({ op: 'delete', model: model, found: found, errors: errors });
        }
        return found;
    }

}