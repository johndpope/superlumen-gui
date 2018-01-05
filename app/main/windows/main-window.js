const path = require('path');
const url = require('url');
const crypto = require('crypto');
const fs = require('fs');
const electron = require('electron');
const Config = require('../data/config.js');
const Wallet = require('../data/wallet.js');
const WireManager = require('../wire/wire-manager.js');
const Window = require('./window.js');
const Comm = require('../util/comm.js');
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
         * @type {WireManager}
         */
        this.wire = null;

        /**
         * @type {Wallet}
         */
        this.wallet = null;

        let self = this;
        this.setWallet();
        //set app menus
        let menu = electron.Menu.buildFromTemplate(this.menuTemplate());
        electron.Menu.setApplicationMenu(menu);
        //setup ipc communication
        Comm.listen(this, 'MainWindow.openWallet', this.openWallet);
        Comm.listen(this, 'MainWindow.openKeyFile', this.openKeyFile);
        Comm.listen(this, 'MainWindow.saveKeyFile', this.saveKeyFile);
        Comm.listen(this, 'MainWindow.showAbout', this.showAbout);
        Comm.listen(this, 'MainWindow.showRecoveryQuestions', this.showRecoveryQuestions);
        Comm.listen(this, 'MainWindow.loadTemplate', this.loadTemplate);
        Comm.listen(this, 'MainWindow.wire', this.onWire);
        //load the main template
        if (Config.lastFile) {
            this.loadTemplate('wallet-open');
        } else {
            this.loadTemplate('wallet-create');
        }
    }

    loadTemplate(msg) {
        super.loadTemplate(msg.arg ? msg.arg : msg);
    }

    onWire(msg) {
        if (msg.arg && msg.arg.path && this.wallet && this.wire) {
            let comps = msg.arg.path.split('.');
            if (comps && comps.length) {
                let index = 0;
                let w = this.wire;
                while (index < comps.length - 1) {
                    w = w[comps[index]];
                    index++;
                }
                let f = w[comps[index]];
                if (typeof w === 'object' && typeof f === 'function') {
                    let fargs = [];
                    if (typeof msg.arg.args !== 'undefined') {
                        if (Array.isArray(msg.arg.args)) {
                            fargs = msg.arg.args;
                        } else {
                            fargs = [msg.arg.args];
                        }
                    }
                    //all wire calls should have a callback as the last argument and handle optional arguments before.
                    fargs.push(function (data) {
                        Comm.respond(msg, data); //send the resulting data from the wire call
                    });
                    //make the wire call
                    let data = f.apply(w, fargs);
                } else {
                    throw new Error('Wire chain failed to produce an object and function.');
                }
            }
        }
    }

    openWallet(msg) {
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
            Comm.respond(msg, fileName);
        });
    }

    openKeyFile(msg) {
        electron.dialog.showOpenDialog({
            title: 'Add Key File',
            filters: [
                { name: 'Any Small File (<= 16KB)' }
            ]
        }, function (fileNames) {
            if (!fileNames) {
                Comm.respond(msg, null);
                return;
            };
            let fileName = fileNames[0];
            let valid = true;
            //check file size.
            let stats = fs.statSync(fileName);
            if (stats.size > Wallet.MaxKeyFileSize) {
                electron.dialog.showErrorBox('Invalid Size', `The file selected is too large (${Math.round(stats.size / 1024)}KB). The maximum is ${Wallet.MaxKeyFileSize / 1024}KB.`);
                valid = false;
            } else if (stats.size < Wallet.MinKeyFileSize) {
                electron.dialog.showErrorBox('Invalid Size', `The file selected is too small (${Math.round(stats.size)} Bytes). The minimum is ${Wallet.MinKeyFileSize} Bytes.`);
                valid = false;
            }
            Comm.respond(msg, {
                valid: valid,
                keyFileName: fileName
            });
        });
    }

    saveKeyFile(msg) {
        electron.dialog.showSaveDialog({
            title: 'Save Generated Key File',
            filters: [
                { name: 'Key File', extensions: ['key'] },
                { name: 'Random Binary File', extensions: ['*'] }
            ]
        }, function (fileName) {
            if (!fileName) {
                Comm.respond(msg, null);
                return;
            };
            let buf = crypto.randomBytes(1024 * 4);
            fs.writeFile(fileName, buf, function (err) {
                if (err) {
                    electron.dialog.showErrorBox('Error Writing Key File', 'There was an error writing the key file:\n' + err);
                    Comm.respond(msg, {
                        valid: false,
                        keyFileName: fileName
                    });
                } else {
                    Comm.respond(msg, {
                        valid: true,
                        keyFileName: fileName
                    });
                }
            });
        });
    }

    showAbout(msg) {
        let self = msg && msg.window ? msg.window : this;
        var popup = new AboutWindow(self);
        //don't respond or callback until the dialog is closed.
        win.windowRef.on('close', function () {
            let rr = self.wallet.recovery;
            Comm.respond(msg, true);
        });
        popup.show();
        return true;
    }

    showRecoveryQuestions(msg) {
        let self = msg && msg.window ? msg.window : this;
        let win = new RecoveryQuestionsWindow(self);
        //don't respond or callback until the dialog is closed.
        win.windowRef.on('close', function () {
            let rr = self.wallet.recovery;
            Comm.respond(msg, {
                qa: (rr ? rr.questions.length : 0)
            });
        });
        win.show();
        return true;
    }

    /**
     * Removes the old wallet instance and replaces it with the new one, setting up wires as needed.
     * @param {Wallet} wallet 
     */
    setWallet(wallet) {
        this.wallet = (wallet ? wallet : new Wallet());
        //add wires
        this.wire = new WireManager(this.wallet);
        //return the newly applied wallet
        return wallet;
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
                                self.setWallet();
                                self.loadTemplate('wallet-create');
                            } else {
                                electron.dialog.showMessageBox(self.windowRef, {
                                    type: 'question',
                                    title: 'Close the current wallet?',
                                    message: 'A wallet is currently open, would you like to close it?',
                                    buttons: ['No', 'Yes']
                                }, function (resp) {
                                    if (resp === 1) {
                                        self.setWallet();
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
                                    self.setWallet();
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