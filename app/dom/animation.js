
/**
 * Animation is a utility class that provides methods for adjusting and working with DOM animations.
 */
module.exports = class Animation {

    /**
     * Clears the existing animation without causing a reset. The element's animation-fill-mode should be 'none'.
     * After calling this method you should set the transform and animation properties as desired.
     * @param {String|HTMLElement} element 
     * @returns {HTMLElement}
     */
    static reflow(element) {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        element.style.animation = 'none';
        void element.offsetWidth; //trigger reflow
        return element;
    }

    /**
     * Returns the current rotation angle of a "rotate" transform.
     * @returns {Number} 
     */
    static getRotationAngle(element) {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        var st = window.getComputedStyle(element, null);
        var tr = st.getPropertyValue("-webkit-transform") ||
            st.getPropertyValue("-moz-transform") ||
            st.getPropertyValue("-ms-transform") ||
            st.getPropertyValue("-o-transform") ||
            st.getPropertyValue("transform");
        if (tr !== "none") {
            var values = tr.split('(')[1];
            values = values.split(')')[0];
            values = values.split(',');
            var a = values[0];
            var b = values[1];
            var c = values[2];
            var d = values[3];
            var scale = Math.sqrt(a * a + b * b);
            var radians = Math.atan2(b, a);
            if (radians < 0) {
                radians += (2 * Math.PI);
            }
            var angle = Math.round(radians * (180 / Math.PI));
        } else {
            var angle = 0;
        }
        return angle;
    }

}