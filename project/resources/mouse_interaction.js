/*
Author: Umberto Laghi
E-mail: umberto.laghi@studio.unibo.it
Github: @ubolakes
*/

/* this file contains the functions used to manage mouse interaction on canvas */

// defining variables
var drag = false;
var old_x, oldy;
var zoom_enabled = false;
var dX, dY;

// linking event listeners to handlers
function addMouseInteraction(scene) {
    scene.canvas.onmousedown = mouseDown;
    scene.canvas.onmouseup = mouseUp;
    scene.canvas.mouseout = mouseOut;
    scene.canvas.onmouseover = mouseOver;
    scene.canvas.onmousemove = mouseMove;
    scene.canvas.onwheel = onWheel;
}

// pressing mouse button
var mouseDown = function(e){
    drag = true;
    old_x = e.pageX, old_y = e.pageY;
    e.preventDefault();
    return false;
};

// releasing mouse button
var mouseUp = function(e) {
    // disabling drag
    drag = false;
};

// moving cursor out
var mouseOut = function(e) {
    // disabling drag
    drag = false
    // disabling zoom
    zoom_enabled = false;
    //console.log("Zoom enabled: "+ zoom_enabled);
}

// moving cursor
var mouseMove = function(e) {
    if (!drag)
        return false;
    // computing deltas on both aces
    dX = (e.pageX - old_x) * 2 * Math.PI / scene.canvas.width;
    dY = (e.pageY - old_y) * 2 * Math.PI / scene.canvas.height;
    // updating camera parameters
    scene.camera.pan(-dX * 0.2);
    scene.camera.tilt(-dY * 0.2);
    // updating old parameters
    old_x = e.pageX, old_y = e.pageY;
    e.preventDefault();
};

// mouse on canvas
var mouseOver = function(e) {
    // enabling zoom in and out
    zoom_enabled = true;
}

// using wheel to zoom 
var onWheel = function(e) {
    if (!zoom_enabled)
        return false;
    // getting closer or further
    scene.camera.dolly(-e.deltaY/100);
    e.preventDefault();
};