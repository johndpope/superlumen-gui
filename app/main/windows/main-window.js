const path = require('path');
const url = require('url');
const crypto = require('crypto');
const fs = require('fs');
const electron = require('electron');
const Config = require('../data/config.js');
const Wallet = require('../data/wallet.js');
const Window = require('./window.js');
const AboutWindow = require('./about-window.js');
const RecoveryQuestionsWindow = require('./recovery-questions-window.js');

module.exports = class MainWindow extends Window {
    constructor() {
        super({
            width: 760,
            height: 460,
            fullscreenable: false,
            show: false,
            backgroundColor: '#E7E7E7',
            webPreferences: {
                nodeIntegration: false,
                preload: path.join(__dirname, '..', '..', 'rendered', 'templates', 'preload.js')
            }
        });

        /**
         * @type {Wallet}
         */
        this.wallet = null;

        let self = this;
        //set app menus
        let menu = electron.Menu.buildFromTemplate(this.menuTemplate());
        electron.Menu.setApplicationMenu(menu);
        //setup ipc communication
        electron.ipcMain.on('openWallet', this.openWallet);
        electron.ipcMain.on('openKeyFile', this.openKeyFile);
        electron.ipcMain.on('saveKeyFile', this.saveKeyFile);
        electron.ipcMain.on('showAbout', this.showAbout);
        electron.ipcMain.on('showRecoveryQuestions', this.showRecoveryQuestions);
        electron.ipcMain.on('loadTemplate', function (e, arg) {
            e.returnValue = true;
            self.loadTemplate(arg);
        });
        //load the main template
        if (Config.lastFile) {
            this.loadTemplate('wallet-open');
        } else {
            this.loadTemplate('wallet-create');
        }
    }

    openWallet(e, arg) {
        electron.dialog.showOpenDialog({
            filters: [
                { name: 'Superlumen Wallet', extensions: ['slw'] }
            ]
        }, function (fileNames) {
            let fileName = null;
            if (fileNames) {
                fileName = fileNames[0];
                Config.lastFile = fileName;
            }
            if (e && e.sender) {
                e.sender.send('openWallet', fileName);
            }
        });
    }

    openKeyFile(e, arg) {
        electron.dialog.showOpenDialog({
            title: 'Add Key File',
            filters: [
                { name: 'Any Small File (<= 16KB)' }
            ]
        }, function (fileNames) {
            if (!fileNames) {
                if (e && e.sender) {
                    e.sender.send('openKeyFile', null);
                }
                return;
            };
            let fileName = fileNames[0];
            //check file size.
            let stats = fs.statSync(fileName)
            if (stats.size > Wallet.MaxKeyFileSize) {
                electron.dialog.showErrorBox('Invalid Size', `The file selected is too large (${Math.round(stats.size / 1024)}KB). The maximum is ${Wallet.MaxKeyFileSize / 1024}KB.`);
                if (e && e.sender) {
                    e.sender.send('openKeyFile', {
                        valid: false,
                        keyFileName: fileName
                    });
                }
            } else if (stats.size < Wallet.MinKeyFileSize) {
                electron.dialog.showErrorBox('Invalid Size', `The file selected is too small (${Math.round(stats.size)} Bytes). The minimum is ${Wallet.MinKeyFileSize} Bytes.`);
                if (e && e.sender) {
                    e.sender.send('openKeyFile', {
                        valid: false,
                        keyFileName: fileName
                    });
                }
            } else {
                if (e && e.sender) {
                    e.sender.send('openKeyFile', {
                        valid: true,
                        keyFileName: fileName
                    });
                }
            }
        });
    }

    saveKeyFile(e, arg) {
        electron.dialog.showSaveDialog({
            title: 'Save Generated Key File',
            filters: [
                { name: 'Key File', extensions: ['key'] },
                { name: 'Random Binary File', extensions: ['*'] }
            ]
        }, function (fileName) {
            if (!fileName) {
                if (e && e.sender) {
                    e.sender.send('saveKeyFile', null);
                }
                return;
            };
            let buf = crypto.randomBytes(1024 * 4);
            fs.writeFile(fileName, buf, function (err) {
                if (err) {
                    electron.dialog.showErrorBox('Error Writing Key File', 'There was an error writing the key file:\n' + err);
                    if (e && e.sender) {
                        e.sender.send('saveKeyFile', {
                            valid: false,
                            keyFileName: fileName
                        });
                    }
                } else {
                    if (e && e.sender) {
                        e.sender.send('saveKeyFile', {
                            valid: true,
                            keyFileName: fileName
                        });
                    }
                }
            });
        });
    }

    showAbout(e, arg) {
        let self = e && e.sender && e.sender.browserWindowOptions ? e.sender.browserWindowOptions.window : this;
        var popup = new AboutWindow(self);
        popup.show();
    }

    showRecoveryQuestions(e, arg) {
        let self = e && e.sender && e.sender.browserWindowOptions ? e.sender.browserWindowOptions.window : this;
        let win = new RecoveryQuestionsWindow(self);
        win.show();
    }

    menuTemplate() {
        let self = this;
        let template = [
            {
                label: 'File',
                submenu: [
                    {
                        label: 'New Wallet',
                        accelerator: 'CommandOrControl+N',
                        click: function () {

                        }
                    },
                    {
                        label: 'Open Wallet',
                        accelerator: 'CommandOrControl+O',
                        click: function () {

                        }
                    },
                    {
                        label: 'Recovery...',
                        click: function () {

                        }
                    },
                    { type: 'separator' },
                    { role: 'quit' }
                ]
            },
            {
                label: 'Edit',
                submenu: [
                    { role: 'undo' },
                    { role: 'redo' },
                    { type: 'separator' },
                    { role: 'cut' },
                    { role: 'copy' },
                    { role: 'paste' },
                ]
            },
            {
                label: 'Developer',
                visible: Config.development,
                submenu: [
                    { role: 'reload' },
                    { role: 'forcereload' },
                    {
                        label: 'Open Dev Tools',
                        accelerator: 'F12',
                        click: function () {
                            self.windowRef.toggleDevTools();
                        }
                    },
                    { role: 'toggledevtools' }
                ]
            },
            {
                role: 'help',
                submenu: [
                    {
                        label: 'What are Lumens?',
                        click: function () {
                            electron.shell.openExternal('http://www.stellar.org/lumens');
                        }
                    },
                    {
                        label: 'How does Stellar Work?',
                        click: function () {
                            electron.shell.openExternal('https://www.stellar.org/how-it-works/stellar-basics/');
                        }
                    },
                    { type: 'separator' },
                    {
                        label: 'Visit superlumen.org',
                        click: function () {
                            electron.shell.openExternal('http://www.superlumen.org');
                        }
                    },
                    {
                        label: 'Visit stellar.org',
                        click: function () {
                            electron.shell.openExternal('http://www.stellar.org');
                        }
                    },
                    { type: 'separator' },
                    {
                        label: 'About',
                        click: function () {
                            self.showAbout();
                        }
                    }
                ]
            }
        ];
        return template;
    }

}