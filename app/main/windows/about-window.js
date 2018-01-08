const path = require('path');
const url = require('url');
const electron = require('electron');
const Config = require('../models/config.js');
const Window = require('./window.js');

module.exports = class AboutWindow extends Window {
    constructor(parent) {
        super({
            width: 640,
            height: 390,
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
                nodeIntegration: false
            }
        });

        this.windowRef.setMenu(null); //no menu
        //load the about template
        this.loadTemplate('about');
    }

}