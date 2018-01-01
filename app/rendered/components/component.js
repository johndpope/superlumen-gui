/**
 * This is an abstract (non-initializable) class definition to be extended by an implementing component class.
 * @class
 */
export default class Component {

    /**
     * Constructs a ViewModel object, should only be called by an extending class via 'super'.
     */
    constructor() {
        //validated
        if (new.target === Component) {
            throw new Error('Component is an abstract class and should not be initiated alone.');
        } else if (typeof this.bind !== 'function') {
            throw new Error('Function "bind" must be implemented on the extending class.');
        }
    }

}