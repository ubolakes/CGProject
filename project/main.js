/*TODO:
    add author and contact */
//"use strict"; // necessary? what's the meaning

var canvas = document.getElementById("canvas"); // getting canvas from HTML file
gl = canvas.getContext("webgl"); // getting webgl context from canvas

// variables to save geometry of meshes
var mesh = new Array();
var positions = [];
var normals = [];
var texcoords = [];
var numVertices
// variables to save illuminations info
var ambient;
var diffuse;
var specular;
var emissive;
var shininess;
var opacity;

// setting path for required mesh
mesh.sourceMesh = 'TODO';
// calling the LoadMesh function
LoadMesh(gl, mesh);

// creating shader program using webgl-utils.js
var shaderprogram = webglUtils.createProgramFromScripts(gl, ["vertex-shader", "fragment-shader"]);

// TODO: associating attributes to vertex shader
var _Pmatrix = gl.getUniformLocation(shaderprogram, "Pmatrix");
var _Vmatrix = gl.getUniformLocation(shaderprogram, "Vmatrix");
var _Mmatrix = gl.getUniformLocation(shaderprogram, "Mmatrix");

// TODO: bind vertex buffer
// buffer for positions
var positionBuffer = gl.createBuffer(); // creating buffer
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer); // buffer binding
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW); // buffer loading

// buffer for normals
var normalsBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

// buffer for texture coordinates
var texcoordBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texcoords), gl.STATIC_DRAW);






// TODO: bind color/texture buffer

gl.useProgram(shaderprogram);

// support functions
// TODO: move it to a more appropriate file or location
function degToRad(d){
    return d*Math.PI/180;
}

// defining projection matrix
var aspect = gl.canvas.clientWidth/gl.canvas.clientHeight;
var zNear = 1;
var zFar = 100;
var fov = 40;
var proj_matrix = m4.perspective(degToRad(fov), aspect, zNear, zFar);

// defining view_matrix
var THETA = 0;
var PHI = 0;
var D = 5;
var camera = [  D*Math.sin(PHI)*Math.cos(THETA),
                D*Math.sin(PHI)*Math.sin(THETA),
                D*Math.cos(PHI)];
var target = [0, 0, 0]; // can be changed
var up = [0, 1, 0];
var view_matrix = m4.inverse(m4.lookAt(camera, target, up));

// binding computed matrices to shader inputs
gl.uniformMatrix4fv(_Pmatrix, false, proj_matrix);
gl.uniformMatrix4fv(_Vmatrix, false, view_matrix);

// mouse events management
var AMORTIZATION = 0.95;
var drag = false;
var old_x, old_y;
var dX = 0, dY = 0;

// binding
canvas.onmousedown = mouseDown;
canvas.onmouseup = mouseUp;
canvas.mouseout = mouseUp;
canvas.onmousemove = mouseMove;

// functions
var mouseDown = function(e){
// TODO
};

var mouseUp = function(e) {
// TODO
};

var mouseMove = function(e) {
// TODO
};

var onWheel = function(e) {
// TODO
/*look at  */
};

// render function
var old_t = 0;

var render = function(time) {
    var dt = time - old_t;

    if(!drag) { // the scene is not being moved
        dX *= AMORTIZATION;
        dY *= AMORTIZATION;
        THETA += dX;
        PHI += dY;
    }

    // changing matrix values according to the changes in camera params
    var mo_matrix = [];
    m4.identity(mo_matrix);
    m4.yRotate(mo_matrix, THETA, mo_matrix);
    m4.xRotate(mo_matrix, PHI, mo_matrix);

    old_t = time;

    // tests
    gl.enable(gl.DEPTH_TEST);
    // gl.depthFunc(gl.LEQUAL); 
    // canvas cleaning
    gl.clearColor(0.75, 0.75, 0.75, 1); 
    gl.clearDepth(1.0);
    // window to viewport transformation
    gl.viewport(0.0, 0.0, canvas.width, canvas.height); 
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // gl.uniformMatrix4fv(_Pmatrix, false, proj_matrix); 
    // gl.uniformMatrix4fv(_Vmatrix, false, view_matrix); 
    gl.uniformMatrix4fv(_Mmatrix, false, mo_matrix);

    // TODO: add buffers
    //gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);

    // drawing the scene
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

    window.requestAnimationFrame(render); 
};

render(0);