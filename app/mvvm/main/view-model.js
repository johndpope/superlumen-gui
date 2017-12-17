const ViewModel = require('../../structure/view-model.js');

module.exports = class IndexViewModel extends ViewModel {
    constructor() {
        super(__filename);
    }

    static init() {
        return new IndexViewModel();
    }

    render() {
        $(document).foundation();
        
    }

}
