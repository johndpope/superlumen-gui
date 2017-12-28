/** SUPERLUMEN - Copyright 2017 Super-Lumen - www.superlumen.org */
var bundle = (function (exports) {
'use strict';

class Randomization {

    /**
     * Returns a whole random number in-between or at "min" and "max" values.
     * @param {Number} min
     * @param {Number} max
     * @returns {Number}
     */
    static number(min, max) {
        let n = Math.round(Math.random() * (max + 1 - min) + min);
        n = n > max ? max : n;
        n = n < min ? min : n;
        return n;
    }

    static newid() {
        return Randomization.number(1000000, 9999999).toString() +
            Math.round(new Date().getTime() * 10000 * Math.random()).toString();
    }
}

/**
 * This is an abstract (non-initializable) class definition to be extended by an implementing view model class.
 */
class ViewModel {

    /**
     * Constructs a ViewModel object, should only be called by an extending class via 'super'.
     */
    constructor() {
        //validated
        if (new.target === ViewModel) {
            throw new Error('ViewModel is an abstract class and should not be initiated alone.');
        } else if (typeof this.constructor.init !== 'function') {
            throw new Error('Static function "init" must be implemented on the extending class.');
        } else if (typeof this.render !== 'function') {
            throw new Error('Function "render" must be implemented on the extending class.');
        }
        this.id = ViewModel.newid();
        this.parent = null;
        this.children = [];
        this.element = null;
        //setup events and listeners
        if (window && window.document) {
            //fire render when the DOM is ready
            var self = this;
            document.addEventListener("DOMContentLoaded", function () {
                var classes = document.getElementsByTagName('body')[0].classList.add('view-ready');
                self.render();
            });
        }
    }

    /**
     * Generates a new ID that can be used for a view.
     * @returns {String}
     */
    static newid() {
        let id = Randomization.newid();
        return id;
    }

    /**
     * Returns the view-model set on the HTML body, indicating the default view-model to initaialize.
     */
    static bodyViewModel() {
        return document.getElementsByTagName('body')[0]
            .getAttribute('data-view-model');
    }

    /**
     * Adds a viewmodel to this one and renders under the specified element.
     * @param {String} mvvm - The name of the mvvm to load.
     * @param {String|HTMLElement} element 
     * @param {String} [id] - Optional id of the viewmodel entry. If not specified, a random value is chosen.
     */
    add(mvvm, element, id) {
        if (typeof mvvm !== 'string') {
            throw new Error('Argument "mvvm" must be a string.');
        }
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        if (element instanceof HTMLElement === false) {
            throw new Error('Argument "element" was not an HTMLElement or could not be found by selector query.');
        }
        //locate and load the view and view-model into the element.
        var mvvmDir = path.resolve(path.join(path.dirname(this.fileName), '..', mvvm));

        //look for a view-model file
        let vmFilePath = path.join(mvvmDir, 'view-model.js');
        if (fs.existsSync(vmFilePath)) {
            //setup
            if (this.children == null || Array.isArray(this.children) === false) {
                this.children = [];
            }
            var id = (id || ViewModel.newid());
            if (this.contains(id)) {
                throw new Error('The id specified is already in use.');
            }
            let div = document.createElement('div');
            div.className = 'view view-' + mvvm;
            div.innerHTML = fs.readFileSync(path.join(mvvmDir, 'view.html'), 'utf8');
            div.id = 'view-' + id;
            div.setAttribute('data-view-model-id', id);
            //insert into the element
            element.appendChild(div);
            element.className = "active-" + mvvm;
            //autoload and setup the view-model
            let viewmodel = require(vmFilePath).init();
            viewmodel.id = id;
            viewmodel.parent = this;
            viewmodel.element = div;
            //add the view-model to this view-model's children
            this.children.push(viewmodel);
            //check if the document ready-state has already fired
            if (window && window.document) {
                if (document.getElementsByTagName('body')[0].classList.contains('view-ready')) {
                    viewmodel.render();
                }
            }
            return viewmodel;
        }
        throw new Error(`A view-model could not be found under the mvvm "${mvvm}"`);
    }

    /**
     * Removes a child viewmodel by the viewmodel id or instance.
     * @param {String|ViewModel} vmid - The id of the viewmodel or a viewmodel instance.
     * @returns {Boolean} - Returns true if a viewmodel was found and removed. 
     */
    remove(vmid) {
        if (this.children) {
            var isObj = (typeof vmid === 'object');
            for (var x = 0; x < this.children.length; x++) {
                if ((isObj && vmid == this.children[x]) || (isObj === false && this.children[x].id === vmid)) {
                    this.children[x].teardown();
                    this.children.splice(x, 1);
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Removes all child viewmodels.
     */
    removeAll() {
        if (this.children) {
            for (var x = 0; x < this.children.length; x++) {
                this.children[x].teardown();
            }
            this.children.length = 0;
        }
    }

    /**
     * Checks if the given child viewmodel exists by the viewmodel id or instance.
     * @param {String|ViewModel} vmid - The id of the viewmodel or a viewmodel instance.
     * @returns {Boolean}
     */
    contains(vmid) {
        if (this.children) {
            var isObj = (typeof vmid === 'object');
            for (var x = 0; x < this.children.length; x++) {
                if ((isObj && vmid == this.children[x]) || (isObj === false && this.children[x].id === vmid)) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Called by a viewmodel parent when the view is about to be removed from the collection. 
     */
    teardown() {
        //delete the containing html element
        if (this.element) {
            this.element.remove();
        }
        //clear the parent
        this.parent = null;
    }

}

class AboutViewModel extends ViewModel {
    constructor() {
        super();
    }

    static init() {
        return new AboutViewModel();
    }

    render() { }

}


class TacowModel extends ViewModel {
    constructor() {
        super();
    }

    static init() {
        return new AboutViewModel();
    }

    render() { }

}

/**
 * Utility class that helps facilitate communication between the Electron main process and the rendered content.
 */
class Comm {

    /**
     * Sends a communication to the Electron main process. If a callback function is provided, the function call is
     * made asynchronously, awaiting a response on the same channel.
     * @param {String} channel 
     * @param {*} arg 
     * @param {Function} [callback]
     */
    static send(channel, arg, callback) {
        if (window.ipc) {
            if (callback) {
                window.ipc.send(channel, arg);
                window.ipc.once(channel, callback);
            } else {
                return window.ipc.sendSync(channel, arg);
            }
        }
    }

}

class WalletCreateModel {
    constructor() {
        this.password = null;
        this.keyFilePath = null;
        this.recovery = {
            enabled: true,
            questions: null,
            answers: null
        }, this.accounts = null;
    }
}

class WalletCreateViewModel extends ViewModel {
    constructor() {
        super();

        this.model = new WalletCreateModel();
    }

    static init() {
        return new WalletCreateViewModel();
    }

    render() {
        $('input:visible:first').focus().select();
        //this.parent.changeLogoRotationSpeed(280);
        $('#link-open-wallet').click(this, this.onOpenWalletClick);
        //password section
        $('input[name="text-password"]').change(this, this.onPasswordChange);
        $('input[name="text-password"]').keyup(this, this.onPasswordChange);
        $('input[name="text-password-confirm"]').change(this, this.onPasswordConfirmChange);
        $('input[name="text-password-confirm"]').keyup(this, this.onPasswordConfirmChange);
        $('.button-key-file').click(this, this.onKeyFileClick);
        $('.button-key-file-generate').click(this, this.onKeyFileGenerateClick);
    }

    onOpenWalletClick(e) {
        Comm.send('openWallet', null, function (e, arg) {
            if (arg) {
                $('.view').fadeOut(function () {
                    Comm.send('loadTemplate', 'wallet-open');
                });
            }
        });
    }

    onPasswordChange(e) {
        var self = e.data;
        let pw = $('input[name="text-password"]').val();
        let lcCount = pw.replace(/[^a-z]/g, '').length;
        let ucCount = pw.replace(/[^A-Z]/g, '').length;
        let numCount = pw.replace(/[^0-9]/g, '').length;
        let splCount = pw.replace(/[a-zA-Z\d\s]/g, '').length;
        let strength =
            (lcCount > 0 ? 0.1 : 0) +
            (ucCount > 0 ? 0.1 : 0) +
            (numCount > 0 ? 0.1 : 0) +
            (splCount > 0 ? 0.1 : 0) +
            ((pw.length > 10 ? 1 : pw.length / 10) * 0.6);
        if (pw) {
            $('.wizard-step-password .progress').show().removeClass('alert warning primary');
            let text = '';
            if (strength <= 0.4) {
                $('.progress').addClass('alert');
                text = (strength > 0.2 ? 'weak' : '');
            } else if (strength <= 0.6) {
                $('.progress').addClass('warning');
                text = 'medium';
            } else if (strength <= 0.8) {
                $('.progress').addClass('warning');
                text = 'strong';
            } else {
                $('.progress').addClass('primary');
                text = 'great';
            }
            $('.wizard-step-password .progress .progress-meter').css('width', (strength * 100) + '%');
            $('.wizard-step-password .progress .progress-meter-text').text(text);
        } else {
            $('.wizard-step-password .progress').hide();
        }
        self.onPasswordConfirmChange(e);
    }

    onPasswordConfirmChange(e) {
        let pw = $('input[name="text-password"]');
        let cpw = $('input[name="text-password-confirm"]');
        if (pw.val() != cpw.val()) {
            $(cpw).siblings('.input-group-label')
                .find('.fa')
                .removeClass('fa-check')
                .addClass('fa-warning');
        } else {
            $(cpw).siblings('.input-group-label')
                .find('.fa')
                .removeClass('fa-warning')
                .addClass('fa-check');
        }
    }

    onKeyFileClick(e) {
        let self = e.data;
        let parent = self.parent; //hold onto ref after this view's teardown
        let button = $('.button-key-file');
        if (button.text() == 'Add Key-File') {
            Comm.send('openKeyFile', null, function (e, arg) {
                if (arg && arg.valid) {
                    button
                        .data('file-name', arg.keyFileName)
                        .text('Remove Key-File')
                        .removeClass('fa-key')
                        .addClass('fa-trash');
                    $('.button-key-file-generate').prop('disabled', button.data('file-name'));
                }
            });
        } else {
            button.data('file-name', '')
                .text('Add Key-File')
                .removeClass('fa-trash')
                .addClass('fa-key');
            $('.button-key-file-generate').prop('disabled', button.data('file-name'));
        }
        e.preventDefault();
        return false;
    }

    onKeyFileGenerateClick(e) {
        let self = e.data;
        let parent = self.parent; //hold onto ref after this view's teardown
        Comm.send('saveKeyFile', null, function (e, arg) {
            if (arg && arg.valid) {
                $('.button-key-file')
                    .data('file-name', arg.keyFileName)
                    .text('Clear Key-File')
                    .removeClass('fa-key')
                    .addClass('fa-trash');
                $('.button-key-file-generate').prop('disabled', true);
            }
        });
    }

}

const ApplicationViewModels = {
    /* The following tag is automatically replaced by rollup with key/values of each view-model 
       detected in the "templates" directory. */
    "./about/": AboutViewModel,
    "./wallet-create/": WalletCreateViewModel
};

//Perform automatic load based on URL location.
if (window.location) {
    let href = window.location.href;
    let tmpPath = 'templates/';
    let tmpIndex = href.indexOf(tmpPath);
    if (tmpIndex >= 0) {
        href = './' + href.substring(tmpIndex + tmpPath.length);
        //remove the last path segment
        href = href.substring(0, href.lastIndexOf('/') + 1);
        if (ApplicationViewModels[href] && ApplicationViewModels[href].init) {
            ApplicationViewModels[href].init();
        } else {
            console.info('No view-model found for path "' + href + '".');
        }
    }
}

exports.TacowModel = TacowModel;

return exports;

}({}));
//# sourceMappingURL=main.js.map
