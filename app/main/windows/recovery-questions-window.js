const path = require('path');
const url = require('url');
const electron = require('electron');
const Config = require('../data/config.js');
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
            backgroundColor: '#040404',
            webPreferences: {
                nodeIntegration: false
            }
        });
        //this.windowRef.setMenu(null); //no menu
        //load the about template
        this.loadTemplate('recovery-questions');
    }

}