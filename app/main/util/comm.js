const electron = require('electron');

/**
 * Utility class to help facilitate main/renderer process communication.
 * @class
 * @static
 */
module.exports = class Comm {

    /**
     * The IPC message object which can also be replaced with a simple callback function.
     * @typedef {Object} CommMessage
     * @property {String} channel
     * @property {Object} e
     * @property {*} arg
     * @property {Function} callback
     */

    /**
     * Creates an ipc listener (ipcMain.on(...)) that provides support for a custom handler and optional callback,
     * which can be used also for making normal calls to the handler.
     * @param {*} owner - The object set as the "this" argument when the handler is executed.
     * @param {String} channel - The channel to listen on.
     * @param {Function} handler - The function to fire when the ipc channel message arrives.
     * @param {Window} window - The window of the ipc messenger.
     * @param {Function} [callback] - Optional callback that fires after the send operation.
     */
    static listen(owner, channel, handler, callback) {
        let f = function (e, arg) {
            if (handler) {
                handler.call(owner, {
                    channel: channel,
                    e: e,
                    arg: arg,
                    window: e && e.sender && e.sender.browserWindowOptions ? e.sender.browserWindowOptions.window : null,
                    callback: callback
                });
            }
        };
        electron.ipcMain.on(channel, f);
        return f;
    }

    /**
     * Provides a clean way to respond to an ipc message or a callback, whichever is passed.
     * @param {CommMessage} msg - The comm message details.
     * @param {*} data - The data sent to the callback and sender via IPC.
     * @returns {*} Returns the data object passed.
     */
    static respond(msg, data) {
        if (!msg) {
            return;
        }
        if (typeof msg === 'function') {
            msg();
        } else if (msg.e) {
            if (msg.e.sender) {
                msg.e.sender.send(msg.channel, data);
            }
            if (typeof msg.callback === 'function') {
                msg.callback(data);
            }
        }
        return data;
    }

}