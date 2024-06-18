/*
Author: Umberto Laghi
E-mail: umberto.laghi@studio.unibo.it
Github: @ubolakes
*/

/* this file contains support function used by others classes or functions */

// converts degrees into radians
function degToRad(value) {
    return value * Math.PI / 180;
}

// determines if a value is power of 2
function isPowerOf2(value) {
    return (value & (value - 1)) === 0;
}

// resizes canvas to the display size
function resizeCanvasToDisplaySize(canvas) {
    // gets display size
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;

    // checks if the canvas is already set
    const needsResize = canvas.width !== displayWidth || canvas.height !== displayHeight;
    
    if (needsResize) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
    }

    return needsResize;
}

// describe
function createXYQuadVertices() {
    let xOffset = 0;
    let yOffset = 0;
    let size = 1;
    return {
        position: {
            numComponents: 2,
            data: [
                xOffset + -1 * size, yOffset + -1 * size,
                xOffset +  1 * size, yOffset + -1 * size,
                xOffset + -1 * size, yOffset +  1 * size,
                xOffset +  1 * size, yOffset +  1 * size,
            ],
        },
        normal: [
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
        ],
        texcoord: [
            0, 0,
            1, 0,
            0, 1,
            1, 1,
        ],
        indices: [ 0, 1, 2, 2, 1, 3 ],
    };
}

// adds the dat.gui to the scene
function add_dat_gui(scene) {
    let gui = new dat.gui.GUI({autoPlace: false});

    scene["Toggle shadows"] = function () {
        scene.toggle_shadows();
    };
    gui.add(scene, "Toggle shadows");

    // adding parameters to manipulate light
    let light_folder = gui.addFolder('Light');

    let light_position =  light_folder.addFolder('Position');
    light_position.add(scene.light.position, 0).min(-10).max(10).step(0.25);
    light_position.add(scene.light.position, 1).min(0).max(10).step(0.25);
    light_position.add(scene.light.position, 2).min(-10).max(10).step(0.25);

    let light_direction =  light_folder.addFolder('Direction');
    light_direction.add(scene.light.direction, 0).min(-10).max(10).step(0.25);
    light_direction.add(scene.light.direction, 1).min(-10).max(10).step(0.25);
    light_direction.add(scene.light.direction, 2).min(-10).max(10).step(0.25);

    // adding dat.GUI to the HTML
    document.getElementById("gui").append(gui.domElement);
}
