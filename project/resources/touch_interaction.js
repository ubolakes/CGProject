/*
Author: Umberto Laghi
E-mail: umberto.laghi@studio.unibo.it
Github: @ubolakes
*/

/* this file contains the functions used to manage touch interaction on canvas */

// defining constant and variables
// single touch point
const max_zoom = 100;
const min_zoom = 1;
var old_x, oldy;
var zoom_enabled = false;
var dX, dY;
// two touch points
var old_x0, old_y0;
var old_x1, old_y1;
var dX0, dY0;
var dX1, dY1;
var old_dist, new_dist;

var touches;
// linking event listeners to handlers
function add_touch_interaction(scene) {
    scene.canvas.ontouchstart = touchStart;
    scene.canvas.ontouchend = touchEnd;
    scene.canvas.ontouchmove = touchMove;
    scene.canvas.ontouchcancel = touchCancel;
}

var touchStart = function(e) {
    e.preventDefault();
    // counting how many points
    if (e.touches.length > 1){
        // setting old values
        old_x0 = e.touches[0].clientX, old_y0 = e.touches[0].clientY;
        old_x1 = e.touches[1].clientX, old_y1 = e.touches[1].clientY;
        // computing old distance
        old_dist = get_2D_distance(old_x0, old_y0, old_x1, old_y1);
    } else { // just one touch point
        const touch = e.touches[0]; // getting the touch object
        old_x = touch.clientX, old_y = touch.clientY;
    }
}

var touchMove = function(e) {
    e.preventDefault();
    // selecting the case based on the number of touch points
    if (e.touches.length > 1){ // two touch points
        pinch_handler(e);
    } else { // just one touch point
    // getting touch object
    const touch = e.touches[0];
    // computing deltas on both aces
    dX = (touch.clientX - old_x) * 2 * Math.PI / scene.canvas.width;
    dY = (touch.clientY - old_y) * 2 * Math.PI / scene.canvas.height;
    // updating camera parameters
    scene.camera.pan(dX * 0.2);
    scene.camera.tilt(dY * 0.2);
    // updating old parameters
    old_x = touch.clientX, old_y = touch.clientY;
    }
}

var touchEnd = function(e) {
    /*  calling touchstart to recount the number of touch points.
        This way, when a finger is removed, it doesn't immediately 
        update the dX and dY based on e.touches[0] and so it 
        removes the annoying shot to new parameters */
    touchStart(e);
}

var touchCancel = function(e) {
    // same reason as touchEnd
    touchStart(e);
}

// pinch to zoom
/*  the idea is pretty simple: it considers two points 
    and computes the distance among them, if it 
    increases it zooms in, otherwise it zooms out */
function pinch_handler(e) {
    e.preventDefault();
    let step = 0.05;
    // getting touch objects
    const touch0 = e.touches[0];
    const touch1 = e.touches[1];
    // computing the distance between points
    new_dist = get_2D_distance(touch0.clientX, touch0.clientY, touch1.clientX, touch1.clientY);
    // computing the difference
    diff = old_dist - new_dist;
    // getting closer or further depending on diff sign
    scene.camera.dolly(step * Math.sign(-diff));
    // assigning old_dist
    old_dist = new_dist;
}  