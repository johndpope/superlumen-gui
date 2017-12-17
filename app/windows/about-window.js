var path = require('path');
var url = require('url');
var electron = require('electron');
var Window = require('./window.js');

module.exports = class AboutWindow extends Window {
    constructor(parent) {
        super({
            width: 640,
            height: 390,
            fullscreenable: false,
            modal: true,
            parent: parent.windowRef,
            maximizable: false,
            minimizable: false,
            resizable: false,
            fullscreenable: false,
            show: false,
            backgroundColor: '#040404'
        });
        //this.windowRef.setMenu(null); //no menu
        //load the about view
        this.loadView('about');
    }

}