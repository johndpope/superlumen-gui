const ViewModel = require('../view-model.js');

module.exports = class RecoveryQuestionsViewModel extends ViewModel {
    constructor() {
        super(__filename);
    }

    static init() {
        return new RecoveryQuestionsViewModel();
    }

    render() { }

}