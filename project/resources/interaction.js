/*
Author: Umberto Laghi
E-mail: umberto.laghi@studio.unibo.it
Github: @ubolakes
*/

// this file contains the functions that implement interaction between the canvas and the user

var mouseDown = function(e){
    drag = true;
    old_x = e.pageX, old_y = e.pageY;
    e.preventDefault();
    return false;
};

var mouseUp = function(e) {
    // disabling drag
    drag = false;
};

var mouseOut = function(e) {
    // disabling drag
    drag = false
    // disabling zoom
    zoom_enabled = false;
    //console.log("Zoom enabled: "+ zoom_enabled);
}

var mouseMove = function(e) {
    if (!drag)
        return false;
    // updating THETA and PHI
    dX = (e.pageX - old_x) * 2 * Math.PI / canvas.width;
    dY = (e.pageY - old_y) * 2 * Math.PI / canvas.height;
    THETA += dX;
    PHI += dY;
    // updating old params
    old_x = e.pageX, old_y = e.pageY;
    e.preventDefault();
};

var mouseOver = function(e) {
    // enabling zoom in and out
    zoom_enabled = true;
    //console.log("Zoom enabled: "+ zoom_enabled);
}

var onWheel = function(e) {
    if (!zoom_enabled)
        return false;
    // checking if D reached the limits
    if(e.deltaY < 0 && fov < max_zoom)
        fov *= 1.1;
    else if (e.deltaY > 0 && fov > min_zoom)
        fov *= 0.9;
    //console.log("delta Y:"+ e.deltaY + " \tfov:" + fov);
    e.preventDefault();
};
