const fs = require('fs');
const path = require('path');
const crypto = require("crypto");

/**
 * This is an abstract (non-initializable) class definition to be extended by an implementing view model class.
 */
module.exports = class ViewModel {

    /**
     * Constructs a ViewModel object, should only be called by an extending class via 'super'.
     * @param {String} fileName - The filename of the inheriting class. Used for name and file structure resolution.
     */
    constructor(fileName) {
        //validated
        if (new.target === ViewModel) {
            throw new Error('ViewModel is an abstract class and should not be initiated alone.');
        } else if (typeof this.constructor.init !== 'function') {
            throw new Error('Static function "init" must be implemented on the extending class.');
        } else if (typeof this.render !== 'function') {
            throw new Error('Function "render" must be implemented on the extending class.');
        } else if (!fileName) {
            throw new Error('The "fileName" argument must be specified.');
        }
        this.fileName = fileName;
        this.id = ViewModel.newid();
        this.parent = null;
        this.children = [];
        this.container = null;
        //setup events and listeners
        if (window && window.document) {
            //fire render when the DOM is ready
            var self = this;
            document.addEventListener("DOMContentLoaded", function() {
                var classes = document.getElementsByTagName('body')[0].classList.add('view-ready');
                self.render();
            });
        }
    }

    /**
     * Generates a new ID that can be used for a view.
     * @returns {String}
     */
    static newid() {
        return crypto.randomBytes(16).toString("hex") + (new Date().getTime() * 10000).toString();
    }

    /**
     * Gets the name of the view, which is the directory name of this view model when this file name is viewmodel.js,
     * or the name of the file when it is named something else.
     * @returns {String} Returns the directory name of the current view.
     */
    name() {
        var fileName = path.basename(this.fileName);
        if (!fileName.match(/viewmodel.js/i)) {
            return fileName.substring(0, fileName.length - path.extname(fileName));
        }
        return path.basename(path.dirname(fileName));
    }

    /**
     * Adds a viewmodel to this one and renders under the specified element.
     * @param {Class|ViewModel} viewmodel - Can be a class or class instance that creates a ViewModel object. When a
     *                                      class is specified, it is searched for a static "init" method which must
     *                                      return a ViewModel instance.
     * @param {String|HTMLElement} element 
     * @param {String} [id] - Optional id of the viewmodel entry. If not specified, a random value is chosen.
     */
    add(viewmodel, element, id) {
        if (typeof viewmodel === 'function' && typeof viewmodel.init === 'function') {
            viewmodel = viewmodel.init();
        }
        if (viewmodel instanceof ViewModel === false) {
            throw new Error('Argument viewmodel is not a ViewModel instance or cannot construct a ViewModel from an "init" function.');
        }
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        if (element instanceof HTMLElement === false) {
            throw new Error('Argument "element" was not an HTMLElement or could not be found by selector query.');
        }
        //setup
        if (this.children == null || Array.isArray(this.children) === false) {
            this.children = [];
        }
        viewmodel.id = (id || viewmodel.id || ViewModel.newid());
        if (this.contains(id)) {
            throw new Error('The id specified is already in use.');
        }
        viewmodel.parent = this;
        viewmodel.element = element;
        //get html
        var div = document.createElement('div');
        div.className = 'view';
        div.id = 'view-' + viewmodel.id;
        div.innerHTML = 'Hiya!'
        //insert into the element
        element.appendChild()
        this.children.push(viewmodel);
    }

    /**
     * Removes a child viewmodel by the viewmodel id or instance.
     * @param {String|ViewModel} vmid - The id of the viewmodel or a viewmodel instance.
     * @returns {Boolean} - Returns true if a viewmodel was found and removed. 
     */
    remove(vmid) {
        if (this.children) {
            var isObj = (typeof vmid === 'object');
            for (var x = 0; x < this.children.length; x++) {
                if ((isObj && vmid == this.children[x]) || (isObj === false && this.children[x].id === vmid)) {
                    this.children[x].teardown();
                    this.children.splice(x, 1);
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Removes all child viewmodels.
     */
    removeAll() {
        if (this.children) {
            for (var x = 0; x < this.children.length; x++) {
                this.children[x].teardown();
            }
            this.children.length = 0;
        }
    }

    /**
     * Checks if the given child viewmodel exists by the viewmodel id or instance.
     * @param {String|ViewModel} vmid - The id of the viewmodel or a viewmodel instance.
     * @returns {Boolean}
     */
    contains(vmid) {
        if (this.children) {
            var isObj = (typeof vmid === 'object');
            for (var x = 0; x < this.children.length; x++) {
                if ((isObj && vmid == this.children[x]) || (isObj === false && this.children[x].id === vmid)) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Called by a viewmodel parent when the view is about to be removed from the collection. 
     */
    teardown() {
        //delete the containing html element
        if (this.element) {
            this.element.parent.removeChild(this.element);
        }
        //clear the parent
        this.parent = null;
    }

}