const Animation = require('../../structure/animation.js');
const ViewModel = require('../../structure/view-model.js');

module.exports = class SetupViewModel extends ViewModel {
    constructor() {
        super(__filename);
    }

    static init() {
        new SetupViewModel();
    }

    render() {
        $(document).foundation();
        //default focus
        $('.open-wallet input:visible:first').focus().select();
    }

    switchTo() {
        
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

$(document).ready(function () {
    
    
    //handle transitions
    $('#link-create-wallet').click(function () {
        setLogoRotationSpeed(120);
        $('body').addClass('create');
        $('.open-wallet').fadeOut(function () {
            $('.create-wallet').fadeIn();
            $('.create-wallet input:visible:first').focus().select();
        });
    });
    $('#link-open-wallet').click(function () {
        setLogoRotationSpeed(420);
        $('body').removeClass('create');
        $('.create-wallet').fadeOut(function () {
            $('.open-wallet').fadeIn();
            $('.open-wallet input:visible:first').focus().select();
        });
    });
    //other events
    $('.open-wallet .button-unlock').click(function () {
        var m = require('../../../main.js');
        console.log(m);
        console.log('wheee');
    });
});