const path = require('path');
const url = require('url');
const electron = require('electron');
const Config = require('../data/config.js');
const RecoveryRecord = require('../data/recovery-record.js');
const Window = require('./window.js');

module.exports = class RecoveryQuestionsWindow extends Window {
    constructor(parent) {
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
            backgroundColor: '#E7E7E7',
            webPreferences: {
                nodeIntegration: false,
                preload: path.join(__dirname, '..', '..', 'rendered', 'templates', 'preload.js')
            }
        });

        //set app menus
        //this.windowRef.setMenu(null); //no menu
        //setup ipc communication
        electron.ipcMain.on('RecoveryQuestionsWindow.setRecovery', this.setRecovery);
        electron.ipcMain.on('RecoveryQuestionsWindow.readRecovery', this.readRecovery);
        //load the about template
        this.loadTemplate('recovery-questions');
    }

    setRecovery(e, arg) {
        let self = e && e.sender && e.sender.browserWindowOptions ? e.sender.browserWindowOptions.window : this;
        if (!arg || !arg.questions || !arg.answers || !self.parent.wallet) {
            e.sender.send('RecoveryQuestionsWindow.setRecovery', false);
            return false;
        }
        if (!self.parent.wallet.recovery) {
            self.parent.wallet.recovery = new RecoveryRecord();
        }
        let rr = self.parent.wallet.recovery;
        if (!rr.unlocked) {
            e.sender.send('RecoveryQuestionsWindow.setRecovery', false);
            return false;
        }
        rr.questions = arg.questions || [];
        rr.answers = arg.answers || [];
        if (e && e.sender) {
            e.sender.send('RecoveryQuestionsWindow.setRecovery', true);
        }
        return true;
    }

    readRecovery(e, arg) {
        let self = e && e.sender && e.sender.browserWindowOptions ? e.sender.browserWindowOptions.window : this;
        let rr = self.parent.wallet.recovery;
        if (e && e.sender) {
            if (rr) {
                e.sender.send('RecoveryQuestionsWindow.readRecovery', {
                    questions: rr.questions,
                    answers: rr.answers
                });
            } else {
                e.sender.send('RecoveryQuestionsWindow.readRecovery', null);
            }
        }
        return rr;
    }

}