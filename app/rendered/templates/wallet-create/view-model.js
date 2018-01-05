import Comm from '../../util/comm.js'
import ViewModel from '../view-model.js';
import Model from './model.js';
import Wizard from '../../components/wizard/wizard.js';
import Security from '../../util/security.js';

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
        //accounts
        $('.wizard-step-accounts .button-new-account').click(this, this.onNewAccount);
        //bind the wizard component
        new Wizard($('.wizard')).bind();
    }

    onOpenWalletClick(e) {
        Comm.send('MainWindow.openWallet', null, function (e, arg) {
            if (arg) {
                $('.view').fadeOut(function () {
                    Comm.send('MainWindow.loadTemplate', 'wallet-open');
                });
            }
        });
    }

    onPasswordChange(e) {
        var self = e.data;
        let pw = $('input[name="text-password"]').val();
        if (pw) {
            let strength = Security.strength(pw);
            $('.wizard-step-password .progress').show().removeClass('alert warning primary');
            let text = '';
            if (strength.rank <= Security.StrengthWeak) {
                $('.progress').addClass('alert');
            } else if (strength.rank <= Security.StrengthMedium) {
                $('.progress').addClass('warning');
            } else {
                $('.progress').addClass('primary');
            }
            $('.wizard-step-password .progress .progress-meter')
                .data('strength', strength.rank)
                .css('width', (strength.rank * 100) + '%');
            $('.wizard-step-password .progress .progress-meter-text').text(strength.label);
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
            Comm.send('MainWindow.openKeyFile', null, function (e, arg) {
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
        Comm.send('MainWindow.saveKeyFile', null, function (e, arg) {
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
        if (strength < Security.StrengthWeak) {
            if (!confirm('Your password is weak, are you sure you want to continue?')) {
                $('.wizard-step-password input[name="text-password"]').focus().select();
                e.preventDefault();
                return false;
            }
        }
    }

    onRecoveryChecked(e) {
        let recoveryEnabled = $('.wizard-step-recovery input[type="checkbox"]').is(':checked');
        let hasQA = $('.wizard-step-recovery .button-setup-recovery').data('hasQA');
        $('.wizard-step-recovery .button-next').prop('disabled', recoveryEnabled && !hasQA);
        $('.wizard-step-recovery .button-setup-recovery').prop('disabled', !recoveryEnabled);
    }

    onConfigureRecovery(e) {
        let self = e.data;
        let parent = self.parent; //hold onto ref after this view's teardown
        Comm.send('MainWindow.showRecoveryQuestions', null, function (e, arg) {
            $('.wizard-step-recovery .button-next').prop('disabled', !(arg && arg.qa > 0));
            $('.wizard-step-recovery .button-setup-recovery').data('hasQA', (arg && arg.qa > 0));
        });
    }

    onNewAccount(e) {
        let self = e.data;
        Comm.send('MainWindow.wire', { path: 'accounts.create' }, function (e, arg) {
            $('.wizard-step-accounts .text-account-id').val(arg.publicKey);
            $('.wizard-step-accounts .text-account-secret').val(arg.privateKey);
        });
    }

}