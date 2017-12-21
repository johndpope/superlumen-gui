const fs = require('fs');
const path = require('path');
const crypto = require("crypto");
const { dialog } = require('electron').remote;
const Wallet = require('../../data/wallet.js');
const Recovery = require('../../data/recovery.js');
const RecoverQuestionsWindow = require('../../windows/recovery-questions-window.js');
const ViewModel = require('../view-model.js');

const MinKeyFileSize = 32;
const MaxKeyFileSize = 1024 * 16;
const GeneratedFileSize = 1024 * 4;

module.exports = class WalletCreateViewModel extends ViewModel {
    constructor() {
        super(__filename);

        /**
         * @type {Wallet}
         */
        this.Wallet = new Wallet();
    }

    static init() {
        return new WalletCreateViewModel();
    }

    render() {
        //default focus
        $('.view-wallet-create input:visible:first').focus().select();
        //this.parent.changeLogoRotationSpeed(280);
        $('#link-open-wallet').click(this, this.onOpenWalletClick);
        $('input[name="text-password"]').change(this, this.onPasswordChange);
        $('input[name="text-password"]').keyup(this, this.onPasswordChange);
        $('input[name="text-password-confirm"]').change(this, this.onPasswordConfirmChange);
        $('input[name="text-password-confirm"]').keyup(this, this.onPasswordConfirmChange);
        $('.button-key-file').click(this, this.onKeyFileClick);
        $('.button-key-file-generate').click(this, this.onKeyFileGenerateClick);
        $('.button-go-password').click(this, this.onWizardToPassword);
        $('.button-go-recovery').click(this, this.onWizardToRecovery);
        $('.button-go-accounts').click(this, this.onWizardToAccounts);
        $('.wizard .wizard-step-recovery input[type="checkbox"]').change(this, this.onRecoveryChecked);
        $('.button-setup-recovery').click(this, this.onSetupRecoveryClick);
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
        $('.progress').show().removeClass('alert warning primary');
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
        $('.progress .progress-meter').css('width', (strength * 100) + '%');
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
            dialog.showOpenDialog({
                title: 'Add Key File',
                filters: [
                    { name: 'Any Small File (<= 16KB)' }
                ]
            }, function (fileNames) {
                if (!fileNames) return;
                let fileName = fileNames[0];
                //check file size.
                let stats = fs.statSync(fileName)
                if (stats.size > MaxKeyFileSize) {
                    alert(`The file selected is too large (${Math.round(stats.size / 1024)}KB). The maximum is ${MaxKeyFileSize / 1024}KB.`);
                } else if (stats.size < MinKeyFileSize) {
                    alert(`The file selected is too small (${Math.round(stats.size)} Bytes). The minimum is ${MinKeyFileSize} Bytes.`);
                } else {
                    button
                        .data('file-name', fileName)
                        .text('Remove Key-File')
                        .removeClass('fa-key')
                        .addClass('fa-trash');
                }
                $('.button-key-file-generate').prop('disabled', button.data('file-name'));
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
        dialog.showSaveDialog({
            title: 'Save Generated Key File',
            filters: [
                { name: 'Key File', extensions: ['key'] },
                { name: 'Random Binary File', extensions: ['*'] }
            ]
        }, function (fileName) {
            if (!fileName) return;
            if (fs.existsSync(fileName)) {
                let dialogResult = dialog.showMessageBox({
                    type: 'question',
                    title: 'File Exists, Overwrite?',
                    message: `The file ${path.basename(fileName)} already exists. Would you like to overwrite?`,
                    buttons: ['No', 'Yes, Overwrite'],
                    defaultId: 1
                });
                if (dialogResult !== 1) {
                    return;
                }
            }
            let buf = crypto.randomBytes(GeneratedFileSize);
            fs.writeFile(fileName, buf, function (err) {
                if (err) {
                    dialog.showErrorBox('Error Writing Key File', 'There was an error writing the key file:\n' + err);
                } else {
                    $('.button-key-file')
                        .data('file-name', fileName)
                        .text('Clear Key-File')
                        .removeClass('fa-key')
                        .addClass('fa-trash');
                    $('.button-key-file-generate').prop('disabled', true);
                }
            });
        });
    }

    onOpenWalletClick(e) {
        let self = e.data;
        let parent = self.parent; //hold onto ref after this view's teardown
        dialog.showOpenDialog({
            filters: [
                { name: 'Superlumen Wallet', extensions: ['slw'] }
            ]
        }, function (fileNames) {
            if (!fileNames) return;
            let fileName = fileNames[0];
            $('.view-wallet-create').fadeOut(function () {
                parent.remove(self.id);
                let vm = parent.add('wallet-open', '#views');
                vm.setWalletFilePath(fileName);
            });
        });
    }

    onWizardToPassword(e) {
        $('.wizard .wizard-step:not(.wizard-step-password)').fadeOut(function () {
            $('.wizard .wizard-step:not(.wizard-step-password)').hide();
            $('.wizard .wizard-step-password').fadeIn();
        });
    }

    onWizardToRecovery(e) {
        let self = e.data;
        if (!self.Wallet.recovery) {
            self.Wallet.recovery = new Recovery();
        }
        let recoveryEnabled = $('.wizard .wizard-step-recovery input[type="checkbox"]').is(':checked');
        $('.wizard .wizard-step-recovery .button-go-accounts').prop('disabled', recoveryEnabled || (recoveryEnabled && !self.Wallet.recovery.questions));
        $('.wizard .wizard-step:not(.wizard-step-recovery)').fadeOut(function () {
            $('.wizard .wizard-step:not(.wizard-step-recovery)').hide();
            $('.wizard .wizard-step-recovery').fadeIn();
        });
    }

    onRecoveryChecked(e) {
        let recoveryEnabled = $('.wizard .wizard-step-recovery input[type="checkbox"]').is(':checked');
        $('.wizard .wizard-step-recovery .button-go-accounts').prop('disabled', recoveryEnabled || (recoveryEnabled && !self.Wallet.recovery.questions));
        $('.wizard .wizard-step-recovery .button-setup-recovery').prop('disabled', !recoveryEnabled);
    }

    onWizardToAccounts(e) {
        let self = e.data;
        //set wallet recovery
        let recoveryEnabled = ($('.wizard .wizard-step-recovery input[type="checkbox"]').is(':checked'));
        if (recoveryEnabled === false) {
            self.Wallet.recovery = null;
        }
        //move to next step
        $('.wizard .wizard-step:not(.wizard-step-accounts)').fadeOut(function () {
            $('.wizard .wizard-step:not(.wizard-step-accounts)').hide();
            $('.wizard .wizard-step-accounts').fadeIn();
        });
    }

    onSetupRecoveryClick(e) {
        let self = e.data;
        let mainWindow = require('electron').remote.getCurrentWindow().window;
        mainWindow.showRecoveryQuestions(self.Wallet);
    }

}