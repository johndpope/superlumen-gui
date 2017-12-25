var path = require('path');
var url = require('url');
var electron = require('electron');
var Config = require('./data/config.js');
var MainWindow = require('./windows/main-window.js');

var Superlumen = module.exports = {

    app: null,

    window: null,

    init: function() {
        Superlumen.app = electron.app;
        //handle event when electron is "ready".
        electron.app.on('ready', function() {
            Superlumen.window = new MainWindow();
            Superlumen.window.show();
        });
        //handle mac-reactivation
        electron.app.on('activate', () => {
            if (window === null) {
                Superlumen.window = new MainWindow();
                Superlumen.window.show();
            }
        });
        //handle event when all windows are closed.
        electron.app.on('window-all-closed', () => {
            if (process.platform !== 'darwin') {
                electron.app.quit()
            }
        });
    }

}