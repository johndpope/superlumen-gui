const { dialog } = require('electron').remote;
const ViewModel = require('../view-model.js');

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