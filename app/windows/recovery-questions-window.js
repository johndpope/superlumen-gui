var path = require('path');
var url = require('url');
var electron = require('electron');
const Wallet = require('../data/wallet.js');
var Window = require('./window.js');

module.exports = class RecoveryQuestionsWindow extends Window {
    constructor(parent, wallet) {
        super({
            width: 640,
            height: 490,
            fullscreenable: false,
            modal: true,
            parent: parent.windowRef,
            maximizable: false,
            minimizable: false,
            resizable: false,
            fullscreenable: false,
            show: false,
            backgroundColor: '#040404',
            webPreferences: {
                preload: path.join(__dirname, '..', 'mvvm', 'autoloader.js')
            }
        });

        /**
         * @type {Wallet}
         */
        this.Wallet = wallet;

        //this.windowRef.setMenu(null); //no menu
        //load the about view
        this.loadView('recovery-questions');
    }

}