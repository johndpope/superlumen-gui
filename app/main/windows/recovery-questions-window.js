const path = require('path');
const url = require('url');
const electron = require('electron');
const Config = require('../data/config.js');
const RecoveryModel = require('../data/recovery.js');
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

        this.model = new RecoveryModel();

        //set app menus
        //this.windowRef.setMenu(null); //no menu
        //setup ipc communication
        electron.ipcMain.on('RecoveryQuestionsWindow.setModel', this.setModel);
        //load the about template
        this.loadTemplate('recovery-questions');
    }

    setModel(e, arg) {
        console.log('hit');
        let self = e && e.sender && e.sender.browserWindowOptions ? e.sender.browserWindowOptions.window : this;
        if (!arg || !arg.questions || !arg.answers) {
            e.sender.send('setModel', false);
            return false;
        }
        self.model.questions = arg.questions || [];
        self.model.answers = arg.answers || [];
        self.model.updatePassword();
        if (e && e.sender) {
            e.sender.send('setModel', true);
        }
        return true;
    }

    readModel(e, arg) {
        let self = e && e.sender && e.sender.browserWindowOptions ? e.sender.browserWindowOptions.window : this;
        if (e && e.sender) {
            e.sender.send('readModel', self.model);
        }
        return self.model;
    }

}