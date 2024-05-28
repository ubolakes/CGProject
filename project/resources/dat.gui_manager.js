/*
Author: Umberto Laghi
E-mail: umberto.laghi@studio.unibo.it
Github: @ubolakes
*/

// this file contains the functions to manage the dat.gui controls 

var controls = {
    lightBrightness: 1.0,
    //lightColor: 0xFFFFFF,
    rotationSpeed: 0,
    //fogDensity: 5,
}

function define_gui(){
    var gui = new dat.GUI();
    
    // adding parameters
    gui.add(controls, "lightBrightness").min(0.1).max(1.0).step(0.01);
    //gui.addColor(controls, "lightColor"); // TODO: finish implementing
    gui.add(controls, "rotationSpeed").min(0.0).max(10.0).step(0.1);
    /*TODO: fog density */
    // TODO: implement fog in the shaders
    
    // boolean params don't need any min or max
    //gui.add(controls, "ciao");
}
