import Comm from '../../util/comm.js'
import ViewModel from '../view-model.js';
import Model from './model.js';
import Wizard from '../../components/wizard/wizard.js';

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
        $('.wizard-step-password input[name="text-password"]').change(this, this.onPasswordChange);
        $('.wizard-step-password input[name="text-password"]').keyup(this, this.onPasswordChange);
        $('.wizard-step-password input[name="text-password-confirm"]').change(this, this.onPasswordConfirmChange);
        $('.wizard-step-password input[name="text-password-confirm"]').keyup(this, this.onPasswordConfirmChange);
        $('.wizard-step-password .button-key-file').click(this, this.onKeyFileClick);
        $('.wizard-step-password .button-key-file-generate').click(this, this.onKeyFileGenerateClick);
        $('.wizard-step-password .button-key-file-about').click(this, this.onKeyFileAboutClick);
        $('.wizard-step-password .button-next').click(this, this.onPasswordNextClick);
        //recovery
        $('.wizard-step-recovery input[type="checkbox"]').change(this, this.onRecoveryChecked);
        $('.wizard-step-recovery .button-setup-recovery').click(this, this.onConfigureRecovery);
        //bind the wizard component
        new Wizard($('.wizard')).bind();
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
            (pw.length > 14 ? 1 : pw.length / 14) * (
                (lcCount > 0 ? 0.15 : 0) +
                (ucCount > 0 ? 0.25 : 0) +
                (numCount > 0 ? 0.25 : 0) +
                (splCount > 0 ? 0.35 : 0)
            );
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
            } else if (strength <= 0.95) {
                $('.progress').addClass('primary');
                text = 'great';
            } else {
                $('.progress').addClass('primary');
                text = 'superlumenal';
            }
            $('.wizard-step-password .progress .progress-meter')
                .data('strength', strength)
                .css('width', (strength * 100) + '%');
            $('.wizard-step-password .progress .progress-meter-text').text(text);
        } else {
            $('.wizard-step-password .progress').hide();
            $('.wizard-step-password .progress .progress-meter').data('strength', 0);
        }
        self.onPasswordConfirmChange(e);
    }

    onPasswordConfirmChange(e) {
        let pw = $('.wizard-step-password input[name="text-password"]');
        let cpw = $('.wizard-step-password input[name="text-password-confirm"]');
        let confirmed = (pw.val() === cpw.val());
        $('.wizard-step-password .button-next').prop('disabled', !(confirmed && pw.val()));
        if (confirmed) {
            $(cpw).siblings('.input-group-label')
                .find('.fa')
                .removeClass('fa-warning')
                .addClass('fa-check');
        } else {
            $(cpw).siblings('.input-group-label')
                .find('.fa')
                .removeClass('fa-check')
                .addClass('fa-warning');
        }
    }

    onKeyFileClick(e) {
        let self = e.data;
        let parent = self.parent; //hold onto ref after this view's teardown
        let button = $('.button-key-file');
        if (button.text() == 'Select Key-File') {
            Comm.send('openKeyFile', null, function (e, arg) {
                if (arg && arg.valid) {
                    button
                        .data('file-name', arg.keyFileName)
                        .text('Remove Key-File')
                        .removeClass('fa-key')
                        .addClass('fa-trash');
                    $('.wizard-step-password .button-key-file-generate').prop('disabled', button.data('file-name'));
                }
            });
        } else {
            button.data('file-name', '')
                .text('Select Key-File')
                .removeClass('fa-trash')
                .addClass('fa-key');
            $('.wizard-step-password .button-key-file-generate').prop('disabled', button.data('file-name'));
        }
        e.preventDefault();
        return false;
    }

    onKeyFileGenerateClick(e) {
        let self = e.data;
        let parent = self.parent; //hold onto ref after this view's teardown
        Comm.send('saveKeyFile', null, function (e, arg) {
            if (arg && arg.valid) {
                $('.wizard-step-password .button-key-file')
                    .data('file-name', arg.keyFileName)
                    .text('Remove Key-File')
                    .removeClass('fa-key')
                    .addClass('fa-trash');
                $('.wizard-step-password .button-key-file-generate').prop('disabled', true);
            }
        });
    }

    onKeyFileAboutClick(e) {
        alert(`A key-file is a small file containing random data. Key-files drastically increase the strength of the encryption used on your wallet, but you must always have access to the key-file when opening your wallet.\n\nLike passwords, you should keep the key-file secure and hidden away.`);
    }

    onPasswordNextClick(e) {
        let strength = $('.wizard-step-password .progress .progress-meter').data('strength');
        if (strength < 0.4) {
            if (!confirm('Your password is weak, are you sure you want to continue?')) {
                $('.wizard-step-password input[name="text-password"]').focus().select();
                e.preventDefault();
                return false;
            }
        }
    }

    onRecoveryChecked(e) {
        let recoveryEnabled = $('.wizard-step-recovery input[type="checkbox"]').is(':checked');
        let hasQA = true; //TODO
        $('.wizard-step-recovery .button-next').prop('disabled', recoveryEnabled || (recoveryEnabled && !hasQA));
        $('.wizard-step-recovery .button-setup-recovery').prop('disabled', !recoveryEnabled);
    }

    onConfigureRecovery(e) {
        let self = e.data;
        let parent = self.parent; //hold onto ref after this view's teardown
        Comm.send('showRecoveryQuestions', null, function (e, arg) {
            if (arg && arg.valid) {
                $('.wizard-step-recovery .button-next').prop('disabled', true);
            }
        });
    }


}