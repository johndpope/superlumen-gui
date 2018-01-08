const path = require('path');
const url = require('url');
const electron = require('electron');
const Config = require('../models/config.js');

module.exports = class Window {
    /**
     * @param {Electron.BrowserWindowConstructorOptions} config 
     */
    constructor(config) {
        if (!config) {
            throw new Error('Argument "config" must be provided.');
        }
        //modify config
        let slWindowParent = null;
        config.window = this; //save the reference to the superlumen window.
        if (config.parent) {
            if (config.parent instanceof Window) {
                //parent is a superlumen window, so update config to use the electron browser window
                slWindowParent = config.parent;
                config.parent = slWindowParent.windowRef;
            } else if (config.parent instanceof electron.BrowserWindow) {
                //parent is an electron window, so look for a superlumen window ref in the config.
                if (config.parent &&
                    config.parent.webContents &&
                    config.parent.webContents.browserWindowOptions) {
                    slWindowParent = config.parent.webContents.browserWindowOptions.window
                }
            }
        }



        /**
         * The Electron BrowserWindow object instance.
         * @type {Electron.BrowserWindow}
         */
        this.windowRef = new electron.BrowserWindow(config);

        /**
         * The parent window.
         * @type {Window}
         */
        this.parent = slWindowParent;

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