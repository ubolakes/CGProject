/*
Author: Umberto Laghi
E-mail: umberto.laghi@studio.unibo.it
Github: @ubolakes
*/

/* this file contains the functions used to manage touch interaction on canvas */

// TODO: add comments to explain what's going on
// defining variables
const max_zoom = 100;
const min_zoom = 1;
var drag = false;
var old_x, oldy;
var zoom_enabled = false;
var dX, dY;

function add_touch_support(scene) {
    //scene.canvas.addEventListener('touchstart', mouseDown, false);
    //scene.canvas.addEventListener('touchmove', mouseMove, false);
    //scene.canvas.addEventListener('touchend', mouseUp, false);
    //scene.canvas.addEventListener('touchend', mouseOut, false);
    scene.canvas.ontouchstart = mouseDown;
    scene.canvas.ontouchend = mouseUp;
    scene.canvas.ontouchmove = mouseMove;
    scene.canvas.ontouchcancel = mouseOut;
    scene.canvas.onmousedown = mouseDown;
    scene.canvas.onmouseup = mouseUp;
    scene.canvas.mouseout = mouseOut;
    scene.canvas.onmouseover = mouseOver;
    scene.canvas.onmousemove = mouseMove;
    scene.canvas.onwheel = onWheel;
}

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
    // computing deltas on both axes
    dX = (e.pageX - old_x) * 2 * Math.PI / canvas.width;
    dY = (e.pageY - old_y) * 2 * Math.PI / canvas.height;
    // updating camera parameters
    scene.camera.pan(-dX * 0.2);
    scene.camera.tilt(-dY * 0.2);
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
    // getting closer or further
    scene.camera.dolly(-e.deltaY/100);

    e.preventDefault();
};

