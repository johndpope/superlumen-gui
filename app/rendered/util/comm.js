
/**
 * Utility class that helps facilitate communication between the Electron main process and the rendered content.
 */
export default class Comm {

    /**
     * Sends a communication to the Electron main process. If a callback function is provided, the function call is
     * made asynchronously, awaiting a response on the same channel.
     * @param {String} channel 
     * @param {*} arg 
     * @param {Function} [callback]
     */
    static send(channel, arg, callback) {
        if (window.ipc) {
            if (callback) {
                window.ipc.send(channel, arg);
                window.ipc.once(channel, callback);
            } else {
                return window.ipc.sendSync(channel, arg);
            }
        } else {
            throw new Error('IPC not set - did the preload script run?');
        }
    }

}