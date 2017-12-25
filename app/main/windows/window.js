const path = require('path');
const url = require('url');
const electron = require('electron');
const Config = require('../data/config.js');

module.exports = class Window {
    /**
     * @param {Electron.BrowserWindowConstructorOptions} config 
     */
    constructor(config) {
        if (!config) {
            throw new Error('Argument "config" must be provided.');
        }

        /**
         * The Electron BrowserWindow object instance.
         * @type {Electron.BrowserWindow}
         */
        this.windowRef = new electron.BrowserWindow(config);

        /**
         * The currently loaded template information. This will be populated when a template is loaded via the 
         * "loadTemplate" method.
         */
        this.template = null;

        let self = this;
        //ensure focus on open.
        this.windowRef.once('ready-to-show', () => {
            self.windowRef.show();
            self.windowRef.focus();
        });
        //window events
        this.windowRef.on('closed', () => {
            self.windowRef = null //deref
        });
        //handle target="_blank" link clicks for external URLs
        this.windowRef.webContents.on('new-window', function (e, url) {
            e.preventDefault();
            electron.shell.openExternal(url);
        });
    }

    /**
     * Loads the specific MVVM template by name into the window.
     * @param {String} name 
     */
    loadTemplate(name) {
        this.template = {
            name: name,
            path: path.resolve(path.join(Config.templatePath, name, 'view.html'))
        };
        this.windowRef.loadURL(url.format({
            pathname: this.template.path,
            protocol: 'file:',
            slashes: true
        }));
    }

    /**
     * Loads the specific url into the window.
     * @param {String} url 
     * @param {Electron.LoadURLOptions} options 
     */
    loadUrl(url, options) {
        this.mvvm = null;
        this.windowRef.loadURL(url, options);
    }

    /** Hides the window. */
    hide() {
        this.windowRef.hide();
    }

    /** Shows the window. */
    show() {
        this.windowRef.show();
    }

}