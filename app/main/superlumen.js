const path = require('path');
const url = require('url');
const electron = require('electron');
const nunjucks = require('electron-nunjucks');
const Config = require('./models/config.js');
const MainWindow = require('./windows/main-window.js');

let Superlumen = module.exports = {

    app: null,

    window: null,

    init: function () {
        Superlumen.app = electron.app;
        //install nunjucks rendering
        nunjucks.install(Superlumen.app, {
            path: 'app/rendered/templates/',
            noCache: true,
            filters: [
                {
                    name: 'slug', 
                    func: function(str) {
                        return str.toString().toLowerCase()
                            .replace(/\s+/g, '-')
                            .replace(/[^\w\-]+/g, '')
                            .replace(/\-\-+/g, '-')
                            .replace(/^-+/, '')
                            .replace(/-+$/, '');
                    }
                },
                {
                    name: 'className',
                    func: function(str) {
                        return str.replace(/-/g, ' ').replace(/\b[a-z]/g, function (s) {
                            return s[0].toUpperCase();
                        }).replace(/ /g, '');
                    }
                }
            ]
        });
        //handle event when electron is "ready".
        electron.app.on('ready', function () {
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