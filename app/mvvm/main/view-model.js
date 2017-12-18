const ViewModel = require('../view-model.js');
const Config = require('../../data/config.js');
const Animation = require('../../dom/animation.js');

module.exports = class MainViewModel extends ViewModel {
    constructor() {
        super(__filename);
    }

    static init() {
        return new MainViewModel();
    }

    render() {
        $(document).foundation();
        if (Config.lastFile) {
            this.add('wallet-open', '#views');
        } else {
            this.add('wallet-create', '#views');
        }
    }

    changeLogoRotationSpeed(seconds) {
        var el = document.querySelector('.logo');
        var angle = Animation.getRotationAngle(el);
        Animation.reflow(el);
        //apply last rotation and set the new animation values.
        el.style.transform = 'rotate(' + angle + 'deg)';
        el.style.animation = 'spin ' + seconds + 's linear infinite none';
    }

}
