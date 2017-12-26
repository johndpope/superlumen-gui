const path = require('path');
const url = require('url');
const electron = require('electron');
const Config = require('../data/config.js');
const Window = require('./window.js');
const AboutWindow = require('./about-window.js');
const RecoveryQuestionsWindow = require('./recovery-questions-window.js');

module.exports = class MainWindow extends Window {
    constructor() {
        super({
            width: 760,
            height: 440,
            fullscreenable: false,
            show: false,
            backgroundColor: '#040404',
            webPreferences: {
                nodeIntegration: false
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
        //load the main template
        this.loadTemplate('main');
    }

    showAbout() {
        var popup = new AboutWindow(this);
        popup.show();       
    }

    showRecoveryQuestions() {
        let win = new RecoveryQuestionsWindow(this);
        win.show();
    }

    menuTemplate() {
        let self = this;
        let template = [
            {
                label: 'File',
                submenu: [
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
                        click: function() {
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