$(document).ready(function () {
    $(document).foundation();
    //default focus
    $('.open-wallet input:visible:first').focus().select();
    //handle transitions
    $('#link-create-wallet').click(function () {
        setLogoRotationSpeed(120);
        $('body').addClass('create');
        $('.open-wallet').fadeOut(function () {
            $('.create-wallet').fadeIn();
            $('.create-wallet input:visible:first').focus().select();
        });
    });
    $('#link-open-wallet').click(function () {
        setLogoRotationSpeed(420);
        $('body').removeClass('create');
        $('.create-wallet').fadeOut(function () {
            $('.open-wallet').fadeIn();
            $('.open-wallet input:visible:first').focus().select();
        });
    });
});

function setLogoRotationSpeed(seconds) {
    var el = $('.logo')[0];
    var angle = getCurrentRotationFixed(el);
    el.style.animation = 'none';
    void el.offsetWidth; //trigger reflow
    el.style.transform = 'rotate(' + angle + 'deg)';
    el.style.animation = 'spin ' + seconds + 's linear infinite none'; 
}

function getCurrentRotationFixed(el) {
    var st = window.getComputedStyle(el, null);
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