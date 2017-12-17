var path = require('path');
var url = require('url');
var electron = require('electron');

module.exports = class Window {
    /**
     * @param {Electron.BrowserWindowConstructorOptions} config 
     */
    constructor(config) {
        if (!config) {
            throw new Error('Argument "config" must be provided.');
        }
        var self = this;
        self.windowRef = new electron.BrowserWindow(config);
        //ensure focus on open.
        self.windowRef.once('ready-to-show', () => {
            self.windowRef.show();
            self.windowRef.focus();
        });
        //window events
        self.windowRef.on('closed', () => {
            self.windowRef = null //deref
        });
        //handle target="_blank" link clicks for external URLs
        self.windowRef.webContents.on('new-window', function (e, url) {
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