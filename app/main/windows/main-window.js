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
        this.wallet = new Wallet();

        let self = this;
        //set app menus
        let menu = electron.Menu.buildFromTemplate(this.menuTemplate());
        electron.Menu.setApplicationMenu(menu);
        //setup ipc communication
        electron.ipcMain.on('MainWindow.openWallet', this.openWallet);
        electron.ipcMain.on('MainWindow.openKeyFile', this.openKeyFile);
        electron.ipcMain.on('MainWindow.saveKeyFile', this.saveKeyFile);
        electron.ipcMain.on('MainWindow.showAbout', this.showAbout);
        electron.ipcMain.on('MainWindow.showRecoveryQuestions', this.showRecoveryQuestions);
        electron.ipcMain.on('MainWindow.loadTemplate', function (e, arg) {
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

    openWallet(e, arg, callback) {
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
                e.sender.send('MainWindow.openWallet', fileName);
            }
            if (callback) {
                callback(fileName);
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
                    e.sender.send('MainWindow.openKeyFile', null);
                }
                return;
            };
            let fileName = fileNames[0];
            //check file size.
            let stats = fs.statSync(fileName)
            if (stats.size > Wallet.MaxKeyFileSize) {
                electron.dialog.showErrorBox('Invalid Size', `The file selected is too large (${Math.round(stats.size / 1024)}KB). The maximum is ${Wallet.MaxKeyFileSize / 1024}KB.`);
                if (e && e.sender) {
                    e.sender.send('MainWindow.openKeyFile', {
                        valid: false,
                        keyFileName: fileName
                    });
                }
            } else if (stats.size < Wallet.MinKeyFileSize) {
                electron.dialog.showErrorBox('Invalid Size', `The file selected is too small (${Math.round(stats.size)} Bytes). The minimum is ${Wallet.MinKeyFileSize} Bytes.`);
                if (e && e.sender) {
                    e.sender.send('MainWindow.openKeyFile', {
                        valid: false,
                        keyFileName: fileName
                    });
                }
            } else {
                if (e && e.sender) {
                    e.sender.send('MainWindow.openKeyFile', {
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
                    e.sender.send('MainWindow.saveKeyFile', null);
                }
                return;
            };
            let buf = crypto.randomBytes(1024 * 4);
            fs.writeFile(fileName, buf, function (err) {
                if (err) {
                    electron.dialog.showErrorBox('Error Writing Key File', 'There was an error writing the key file:\n' + err);
                    if (e && e.sender) {
                        e.sender.send('MainWindow.saveKeyFile', {
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
        win.windowRef.on('close', function () {
            if (e && e.sender) {
                let rr = self.wallet.recovery;
                e.sender.send('MainWindow.showRecoveryQuestions', {
                    qa: (rr ? rr.questions.length : 0)
                });
            }
        })
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
                        accelerator: 'CommandOrControl+Alt+N',
                        click: function () {
                            if (!self.wallet || (self.wallet && self.wallet.accounts.length === 0)) {
                                //no wallet yet anyway, just load the template without asking
                                self.wallet = new Wallet();
                                self.loadTemplate('wallet-create');
                            } else {
                                electron.dialog.showMessageBox(self.windowRef, {
                                    type: 'question',
                                    title: 'Close the current wallet?',
                                    message: 'A wallet is currently open, would you like to close it?',
                                    buttons: ['No', 'Yes']
                                }, function (resp) {
                                    if (resp === 1) {
                                        self.wallet = new Wallet();
                                        self.loadTemplate('wallet-create');
                                    }
                                });
                            }
                        }
                    },
                    {
                        label: 'Open Wallet',
                        accelerator: 'CommandOrControl+O',
                        click: function () {
                            self.openWallet(null, null, function (fileName) {
                                if (fileName) {
                                    self.wallet = new Wallet();
                                    self.loadTemplate('wallet-open');
                                }
                            });
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