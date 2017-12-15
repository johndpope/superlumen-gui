var electron = require('electron');
var path = require('path');
var url = require('url');

var self = module.exports = {

    app: null,

    window: null,

    main: function () {
        var self = this;
        self.app = electron.app;
        //handle event when electron is "ready".
        electron.app.on('ready', self.setup);
        //handle mac-reactivation
        electron.app.on('activate', () => {
            if (window === null) {
                self.setup();
            }
        });
        //handle event when all windows are closed.
        electron.app.on('window-all-closed', () => {
            if (process.platform !== 'darwin') {
                electron.app.quit()
            }
        });
    },

    setup: function () {
        var self = this;
        // Create the browser window.
        self.window = new electron.BrowserWindow({
            width: 700,
            height: 440,
            fullscreenable: false,
            backgroundColor: '#1c598c'
        });
        // and load the index.html of the app.
        self.window.loadURL(url.format({
            pathname: path.join(__dirname, 'app', 'views', 'index.html'),
            protocol: 'file:',
            slashes: true
        }));
        //window events
        self.window.on('closed', () => {
            self.window = null //deref
        });
        //handle dev env.
        //self.window.webContents.openDevTools();
    }

};

/**
 * Application initialization.
 */
(function () {
    self.main();
})();

// Quit when all windows are closed.


