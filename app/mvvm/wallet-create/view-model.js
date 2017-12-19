const fs = require('fs');
const path = require('path');
const crypto = require("crypto");
const { dialog } = require('electron').remote;
const ViewModel = require('../view-model.js');

const MinKeyFileSize = 32;
const MaxKeyFileSize = 1024 * 16;
const GeneratedFileSize = 1024 * 4;

module.exports = class WalletCreateViewModel extends ViewModel {
    constructor() {
        super(__filename);
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
        $('.progress').show().removeClass('alert warning success');
        if (strength <= 0.4) {
            $('.progress').addClass('alert');
        } else if (strength <= 0.8) {
            $('.progress').addClass('warning');
        } else {
            $('.progress').addClass('success');
        }
        $('.progress-meter-text').text(`${strength < 0.2 ? '' : strength < 0.4 ? 'low' : strength < 0.6 ? 'medium' : strength < 0.8 ? 'strong' : 'great'}`);
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
                        .text('Clear Key-File')
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
}