import ViewModel from '../view-model.js';

export default class AboutViewModel extends ViewModel {
    constructor() {
        super();
    }

    static init() {
        return new AboutViewModel();
    }

    render() {
        $('.button-close').click(this, this.onCloseClick);
    }

    onCloseClick(e) {
        window.close();
    }

}