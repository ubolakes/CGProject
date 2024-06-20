/*
Author: Umberto Laghi
E-mail: umberto.laghi@studio.unibo.it
Github: @ubolakes
*/

/* this file contains the functions used to manage touch interaction on canvas */

// defining variables
const max_zoom = 100;
const min_zoom = 1;
var drag = false;
var old_x, oldy;
var zoom_enabled = false;
var dX, dY;

// linking event listeners to handlers
function add_touch_interaction(scene) {
    scene.canvas.ontouchstart = touchStart;
    scene.canvas.ontouchend = touchEnd;
    scene.canvas.ontouchmove = touchMove;
    scene.canvas.ontouchcancel = touchCancel;
}

var touchStart = function(e) {
    const touch = e.touches[0]; // getting the touch object
    drag = true;
    old_x = touch.clientX, old_y = touch.clientY;
    e.preventDefault();
    return false;
}

var touchMove = function(e) {
    if (!drag)
        return false;
    // getting touch object
    const touch = e.touches[0];
    // computing deltas on both axes
    dX = (touch.clientX - old_x) * 2 * Math.PI / canvas.width;
    dY = (touch.clientY - old_y) * 2 * Math.PI / canvas.height;
    // updating camera parameters
    scene.camera.pan(-dX * 0.2);
    scene.camera.tilt(-dY * 0.2);
    // updating old params
    old_x = touch.clientX, old_y = touch.clientY;
    e.preventDefault();
}

var touchEnd = function(e) {
    drag = false;
}

var touchCancel = function(e) {
    drag = false;
}