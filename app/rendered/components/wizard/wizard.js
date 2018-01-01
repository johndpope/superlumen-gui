import Component from '../component.js';

/**
 * Provides logic to transition from one wizard step (section) to another.
 * @class
 */
export default class Wizard extends Component {
    constructor(container) {
        super();
        if ($(container).length === 0) {
            throw new Error('Invalid wizard container element.');
        }

        this.container = $(container);

        //ensure a step is active.
        if (!this.container.find('>.wizard-step.active').length) {
            this.goTo(0);
        }
    }

    bind() {
        this.container.find('>.wizard-step .button-next').click(this, this.onNext);
        this.container.find('>.wizard-step .button-back').click(this, this.onBack);
        //handle "ENTER" clicks
        this.container.find('>.wizard-step').find('input,select,textarea').keypress(this, this.onEnter);
        $('body').keypress(this, this.onEnter);
    }

    onEnter(e) {
        let self = e.data;
        if (self.container.is(':visible') && (e.keyCode === 13 || e.which === 13)) {
            if (document.activeElement.tagName.match(/input|select|textarea|body/i)) {
                let nextButton = self.container.find('>.wizard-step.active').closest('.wizard-step').find('.button-next');
                if (!nextButton.prop('disabled')) {
                    nextButton.click();
                    e.preventDefault();
                    return false;
                }
            }
        }
    }

    onNext(e) {
        let self = e.data;
        if (!e.isDefaultPrevented()) {
            self.next();
        }
    }

    onBack(e) {
        let self = e.data;
        if (!e.isDefaultPrevented()) {
            self.back();
        }
    }

    next() {
        let steps = this.container.find('>.wizard-step');
        let activeIndex = steps.index(this.container.find('>.wizard-step.active'));
        let maxIndex = this.container.find('>.wizard-step').length - 1;
        if (activeIndex < maxIndex) {
            this.goTo(++activeIndex);
        }
    }

    back() {
        let steps = this.container.find('>.wizard-step');
        let activeIndex = steps.index(this.container.find('>.wizard-step.active'));
        if (activeIndex > 0) {
            this.goTo(--activeIndex);
        }
    }

    goTo(step) {
        let steps = this.container.find('>.wizard-step');
        let activeIndex = steps.index(this.container.find('>.wizard-step.active'));
        let targetIndex = -1;
        let target = null;
        if (typeof step === 'number') {
            targetIndex = step;
            target = $(steps[targetIndex]);
        } else {
            target = $(step);
            targetIndex = steps.index(target);
        }
        if (targetIndex < 0) {
            throw new Error(`Unable to find wizard step at index ${targetIndex}.`);
        } else if (activeIndex !== targetIndex) {
            this.container.find('>.wizard-step.active').removeClass('active');
            target.addClass('active');
            target.find('.wizard-default-focus').focus().select();
        }
    }

    goToStart() {
        this.goTo(0);
    }

    goToEnd() {
        this.goTo(this.container.find('>.wizard-step').length - 1);
    }
}