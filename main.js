var electron = require('electron');
var path = require('path');
var url = require('url');

var self = module.exports = {

    app: null,

    window: null,

    main: function () {
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
        // Create the browser window.
        self.window = new electron.BrowserWindow({
            width: 700,
            height: 440,
            fullscreenable: false,
            backgroundColor: '#222426'
        });
        // and load the index.html of the app.
        self.window.loadURL(url.format({
            pathname: path.join(__dirname, 'app', 'views', 'index', 'view.html'),
            protocol: 'file:',
            slashes: true
        }));
        //window events
        self.window.on('closed', () => {
            self.window = null //deref
        });
        self.window.webContents.on('new-window', function (e, url) {
            e.preventDefault();
            electron.shell.openExternal(url);
        });
        //set app menus
        var menu = electron.Menu.buildFromTemplate(self.menuTemplate());
        electron.Menu.setApplicationMenu(menu);
        //handle dev env.
        //self.window.webContents.openDevTools();
    },

    handleExternalLinks: function (e, url) {
        if (url.match(/^http/i)) {
            e.preventDefault()
            require('electron').shell.openExternal(url)
        }
    },

    menuTemplate: function () {
        return [
            {
                label: 'File',
                submenu: [
                    { role: 'close' }
                ]
            },
            {
                label: 'Edit',
                submenu: [
                    { role: 'undo' },
                    { role: 'redo' },
                    { type: 'separator' },
                    { role: 'cut' },
                    { role: 'copy' },
                    { role: 'paste' },
                ]
            },
            {
                role: 'help',
                submenu: [
                    {
                        label: 'What are Lumens?',
                        click: function () {
                            electron.shell.openExternal('http://www.stellar.org/lumens');
                        }
                    },
                    {
                        label: 'Superlumen.org',
                        click: function () {
                            electron.shell.openExternal('http://www.superlumen.org');
                        }
                    },
                    { type: 'separator' },
                    {
                        label: 'About',
                        click: function () {
                            var popup = new electron.BrowserWindow({
                                width: 640,
                                height: 420,
                                fullscreenable: false,
                                modal: true,
                                parent: self.window,
                                maximizable: false,
                                minimizable: false,
                                resizable: false,
                                fullscreenable: false,
                                backgroundColor: '#222426'
                            });
                            popup.setMenu(null);
                            // and load the index.html of the app.
                            popup.loadURL(url.format({
                                pathname: path.join(__dirname, 'app', 'views', 'about', 'view.html'),
                                protocol: 'file:',
                                slashes: true
                            }));
                            popup.webContents.on('new-window', function (e, url) {
                                e.preventDefault();
                                electron.shell.openExternal(url);
                            });
                        }
                    }
                ]
            }
        ];
    }

};

/**
 * Application initialization.
 */
(function () {
    self.main();
})();

// Quit when all windows are closed.


