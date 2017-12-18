const path = require('path');
const url = require('url');
const electron = require('electron');

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
     * Loads the specific view by name into the window.
     * @param {String} viewName 
     */
    loadView(viewName) {
        this.windowRef.loadURL(url.format({
            pathname: path.resolve(path.join(__dirname, '..', 'mvvm', viewName, 'view.html')),
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