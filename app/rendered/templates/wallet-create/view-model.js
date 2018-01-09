import Comm from '../../util/comm.js'
import ViewModel from '../view-model.js';
import Wizard from '../../components/wizard/wizard.js';
import Security from '../../util/security.js';

export default class WalletCreateViewModel extends ViewModel {
    constructor() {
        super();
    }

    static init() {
        return new WalletCreateViewModel();
    }

    render() {
        $('input:visible:first').focus().select();
        //open wallet link
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
        $('.wizard-step-accounts input[type="checkbox"]').change(this, this.onNewAccountChecked);
        $('.wizard-step-accounts .button-refresh-account').click(this, this.onRefreshAccountClick);
        $('.wizard-step-accounts .button-account-id-copy').click(this, this.onAccountIDCopy);
        $('.wizard-step-accounts .button-account-secret-copy').click(this, this.onAccountSecretCopy);
        $('.wizard-step-accounts .button-complete').click(this, this.onCompleteClick);
        //populate networks
        if (this.config && this.config.networks) {
            for (let x = 0; x < this.config.networks.length; x++) {
                let nw = this.config.networks[x];
                let opt = $(`<option value="${nw.url}">${nw.label}</option>`).prop('selected', !!nw.default);
                let select = $('.wizard-step-accounts #select-account-network');
                opt.appendTo(select);
            }
        }
        //generate a new address
        this.onRefreshAccountClick();
        //bind the wizard component
        this.wizard = new Wizard($('.wizard')).bind();
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
            $('.wizard-step-password .progress').removeClass('alert warning primary');
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
        let self = e.data;
        let pw = $('.wizard-step-password input[name="text-password"]').val();
        let kf = $('.wizard-step-password .button-key-file').data('file-name');
        let strength = $('.wizard-step-password .progress .progress-meter').data('strength');
        if (strength < Security.StrengthWeak) {
            if (!confirm('Your password is weak, are you sure you want to continue?')) {
                $('.wizard-step-password input[name="text-password"]').focus().select();
                e.preventDefault();
                return false;
            }
        }
        Comm.send('Wire', {
            path: 'wallet.save', args: [{
                label: 'My Wallet',
                password: pw,
                keyFilePath: kf
            }]
        }, function (e, arg) {
            if (arg && arg.errors && arg.errors.length) {
                console.error(arg.errors);
                alert('Unable to set password and/or key file:\n' + arg.errors.join(';\n'));
                self.wizard.back();
            }
        });
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

    onNewAccountChecked(e) {
        let self = e.data;
        let newAccount = $('.wizard-step-accounts input[type="checkbox"]').is(':checked');
        $('.wizard-step-accounts .text-account-id').prop('readonly', newAccount).val('');
        $('.wizard-step-accounts .text-account-secret').prop('readonly', newAccount).val('');
        if (newAccount) {
            self.onRefreshAccountClick();
            $('.wizard-step-accounts .button-refresh-account').show();
        } else {
            $('.wizard-step-accounts .button-refresh-account').hide();
        }
    }

    onRefreshAccountClick(e) {
        Comm.send('Wire', { path: 'accounts.gen' }, function (ev, arg) {
            $('.wizard-step-accounts .text-account-id').val(arg.model.publicKey);
            $('.wizard-step-accounts .text-account-secret').val(arg.model.privateKey);
        });
    }

    onAccountIDCopy(e) {
        let text = $('.wizard-step-accounts .text-account-id').val();
        Comm.send('MainWindow.clipboard', { data: text, type: 'text', title: 'Superlumen: Clipboard', message: 'Account ID copied to clipboard.' });
    }

    onAccountSecretCopy(e) {
        let text = $('.wizard-step-accounts .text-account-secret').val();
        Comm.send('MainWindow.clipboard', { data: text, type: 'text', title: 'Superlumen: Clipboard', message: 'Secret copied to clipboard.' });
    }

    onCompleteClick(e) {
        let self = e.data;
        let accountID = $('.wizard-step-accounts .text-account-id').val().trim();
        let secret = $('.wizard-step-accounts .text-account-secret').val().trim();
        let networkElement = $('.select-account-network option:selected');
        let network = {
            label: networkElement.text(),
            url: networkElement.val()
        };
        Comm.send('Wire', { path: 'accounts.verify', args: [accountID, secret] }, function (ev, arg) {
            if (arg.model) {
                Comm.send('Wire', { path: 'accounts.save', args: [{
                    label: 'My Account',
                    publicKey: accountID,
                    privateKey: secret,
                    network: network
                }] }, function (ev2, arg2) {
                    alert('save!');
                });
            } else {
                alert('The Account ID or Secret is not valid.')
                $('.wizard-step-accounts .text-account-id').focus().select();
            }
        });
    }

}