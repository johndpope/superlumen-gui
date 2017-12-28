import ViewModel from '../view-model.js';

export default class AboutViewModel extends ViewModel {
    constructor() {
        super();
    }

    static init() {
        return new AboutViewModel();
    }

    render() { }

}


export class TacowModel extends ViewModel {
    constructor() {
        super();
    }

    static init() {
        return new AboutViewModel();
    }

    render() { }

}