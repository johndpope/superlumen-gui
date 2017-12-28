import Comm from '../../util/comm.js'
import ViewModel from '../view-model.js';
import Model from './model.js';

export default class WalletCreateViewModel extends ViewModel {
    constructor() {
        super();

        this.model = new Model();
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