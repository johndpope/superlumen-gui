/** SUPERLUMEN - Copyright 2017 Super-Lumen - www.superlumen.org */
var bundle = (function (exports) {
'use strict';

class Randomization {

    /**
     * Returns a whole random number in-between or at "min" and "max" values.
     * @param {Number} min
     * @param {Number} max
     * @returns {Number}
     */
    static number(min, max) {
        let n = Math.round(Math.random() * (max + 1 - min) + min);
        n = n > max ? max : n;
        n = n < min ? min : n;
        return n;
    }

    static newid() {
        return Randomization.number(1000000, 9999999).toString() +
            Math.round(new Date().getTime() * 10000 * Math.random()).toString();
    }
}

/**
 * This is an abstract (non-initializable) class definition to be extended by an implementing view model class.
 */
class ViewModel {

    /**
     * Constructs a ViewModel object, should only be called by an extending class via 'super'.
     */
    constructor() {
        //validated
        if (new.target === ViewModel) {
            throw new Error('ViewModel is an abstract class and should not be initiated alone.');
        } else if (typeof this.constructor.init !== 'function') {
            throw new Error('Static function "init" must be implemented on the extending class.');
        } else if (typeof this.render !== 'function') {
            throw new Error('Function "render" must be implemented on the extending class.');
        }
        this.id = ViewModel.newid();
        this.parent = null;
        this.children = [];
        this.element = null;
        //setup events and listeners
        if (window && window.document) {
            //fire render when the DOM is ready
            var self = this;
            document.addEventListener("DOMContentLoaded", function () {
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
        let id = Randomization.newid();
        return id;
    }

    /**
     * Adds a viewmodel to this one and renders under the specified element.
     * @param {String} mvvm - The name of the mvvm to load.
     * @param {String|HTMLElement} element 
     * @param {String} [id] - Optional id of the viewmodel entry. If not specified, a random value is chosen.
     */
    add(mvvm, element, id) {
        if (typeof mvvm !== 'string') {
            throw new Error('Argument "mvvm" must be a string.');
        }
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        if (element instanceof HTMLElement === false) {
            throw new Error('Argument "element" was not an HTMLElement or could not be found by selector query.');
        }
        //locate and load the view and view-model into the element.
        var mvvmDir = path.resolve(path.join(path.dirname(this.fileName), '..', mvvm));

        //look for a view-model file
        let vmFilePath = path.join(mvvmDir, 'view-model.js');
        if (fs.existsSync(vmFilePath)) {
            //setup
            if (this.children == null || Array.isArray(this.children) === false) {
                this.children = [];
            }
            var id = (id || ViewModel.newid());
            if (this.contains(id)) {
                throw new Error('The id specified is already in use.');
            }
            let div = document.createElement('div');
            div.className = 'view view-' + mvvm;
            div.innerHTML = fs.readFileSync(path.join(mvvmDir, 'view.html'), 'utf8');
            div.id = 'view-' + id;
            div.setAttribute('data-view-model-id', id);
            //insert into the element
            element.appendChild(div);
            element.className = "active-" + mvvm;
            //autoload and setup the view-model
            let viewmodel = require(vmFilePath).init();
            viewmodel.id = id;
            viewmodel.parent = this;
            viewmodel.element = div;
            //add the view-model to this view-model's children
            this.children.push(viewmodel);
            //check if the document ready-state has already fired
            if (window && window.document) {
                if (document.getElementsByTagName('body')[0].classList.contains('view-ready')) {
                    viewmodel.render();
                }
            }
            return viewmodel;
        }
        throw new Error(`A view-model could not be found under the mvvm "${mvvm}"`);
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
            this.element.remove();
        }
        //clear the parent
        this.parent = null;
    }

}

class AboutViewModel extends ViewModel {
    constructor() {
        super();
    }

    static init() {
        return new AboutViewModel();
    }

    render() { }

}

// const path = require('path');
// const fs = require('fs');

//find the loading mvvm directory
//let mvvmDir = path.dirname(window.location.href.substring('file://'.length + __dirname.length + 1));
//look for a view-model.js file, if found, load and init it.
// let vmFilePath = path.join(__dirname, mvvmDir, 'view-model.js');
// if (fs.existsSync(vmFilePath)) {
//     require(vmFilePath).init();
// }

AboutViewModel.init();

return exports;

}({}));
//# sourceMappingURL=main.js.map
