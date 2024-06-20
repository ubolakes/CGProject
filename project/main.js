/*
Author: Umberto Laghi
E-mail: umberto.laghi@studio.unibo.it
Github: @ubolakes
*/

/* this class is the main function to call the others */

function main() {

    // create new scene
    window["scene"] = new Scene("canvas", "./scene/scene.json");

    // adding event listener for keybaord interaction
    window.addEventListener('keydown', (e) => {scene.keys[e.key] = true;});
    window.addEventListener('keyup', (e) => {scene.keys[e.key] = false;});
    
    // adding event listeners for touch interaction
    add_touch_interaction(scene);
    add_mouse_interaction(scene);
    // adding dat.gui
    add_dat_gui(scene);

    // drawing the scene
    draw(scene);
}

main();