const ViewModel = require('../../structure/view-model.js');

module.exports = class AboutViewModel extends ViewModel {
    constructor() {
        super(__filename);
    }

    static init() {
        return new AboutViewModel();
    }

    render() { }

}
