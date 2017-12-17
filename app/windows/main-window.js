const path = require('path');
const url = require('url');
const electron = require('electron');
const Config = require('../data/config.js');
const Window = require('./window.js');
const AboutWindow = require('./about-window.js');

module.exports = class MainWindow extends Window {
    constructor() {
        super({
            width: 700,
            height: 440,
            fullscreenable: false,
            show: false,
            backgroundColor: '#040404'
        });
        let self = this;
        //set app menus
        let menu = electron.Menu.buildFromTemplate(this.menuTemplate());
        electron.Menu.setApplicationMenu(menu);
        //load the main view
        this.loadView('main');
    }

    menuTemplate() {
        let config = new Config();
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
                label: 'Wallet',
                submenu: [

                ]
            },
            {
                label: 'Developer',
                visible: config.development,
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
                        label: 'Superlumen.org',
                        click: function () {
                            electron.shell.openExternal('http://www.superlumen.org');
                        }
                    },
                    { type: 'separator' },
                    {
                        label: 'About',
                        click: function () {
                            var popup = new AboutWindow(self);
                            popup.show();
                        }
                    }
                ]
            }
        ];
        return template;
    }

}