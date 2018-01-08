const path = require('path');
const url = require('url');
const electron = require('electron');
const Config = require('../models/config.js');
const RecoveryModel = require('../models/recovery.js');
const Window = require('./window.js');
const WireManager = require('../wire/wire-manager.js');

module.exports = class RecoveryQuestionsWindow extends Window {
    constructor(parent) {
        super({
            width: 640,
            height: 490,
            fullscreenable: false,
            modal: true,
            parent: parent,
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
        //load the about template
        this.loadTemplate('recovery-questions');
    }

}