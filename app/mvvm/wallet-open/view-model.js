const { dialog } = require('electron').remote;
const ViewModel = require('../view-model.js');

module.exports = class SetupViewModel extends ViewModel {
    constructor() {
        super(__filename);

        /**
         * The wallet file name pending decryption.
         * @type {String}
         */
        this.walletFilePath = null;
    }

    static init() {
        return new SetupViewModel();
    }

    render() {
        $(document).foundation();
        //default focus
        $('.view-wallet-open input:visible:first').focus().select();
        //links
        $('#link-create-wallet').click(this, this.onCreateWalletClick);
        $('#link-open-wallet').click(this, this.onOpenWalletClick);
    }
    
    onCreateWalletClick(e) {
        let self = e.data;
        let parent = self.parent; //hold onto ref after this view's teardown
        $('.view-wallet-open').fadeOut(function () {
            parent.remove(self.id);
            let vm = parent.add('wallet-create', '#views');
        });
    }

    onOpenWalletClick(e) {
        let self = e.data;
        self.browseForWallet();
    }

    browseForWallet() {
        let self = this;
        dialog.showOpenDialog({
            filters: [
                { name: 'Superlumen Wallet', extensions: ['slw'] }
            ]
        }, function (fileNames) {
            if (!fileNames) return;
            self.setWalletFilePath(fileNames[0]);
        });
    }

    setWalletFilePath(filePath) {
        if (filePath.length > 50) {
            filePath = '...' + filePath.substring(filePath.length - 50);
        }
        $('.filename').text(filePath);
    }
}