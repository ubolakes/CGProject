/*TODO:
    add author and contact */
//"use strict"; // necessary? what's the meaning

// range for D
const max_D = 5; // to be defined
const min_D = .5; // to be defined

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

/* TODO: add parameters for dat.GUI

// dat.gui
var controls = {
    ciao: true// TODO: se parameters to control
}

function define_gui(){
    var gui = new dat.GUI();
    // do this for every parameter in range
    gui.add(controls, "<value in controls>")
       .min(min_value)
       .max(max_value)
       .step()
       .onChange(function() { render(); });
    // boolean params don't need any min or max
    gui.add(controls, "ciao");
}

// adding gui to the scene
window.onload = function init() {
    define_gui();
}
*/

// setting path for required mesh
mesh.sourceMesh = 'data/boeing/boeing_3.obj'; // using test mesh imported from class
// calling the LoadMesh function
LoadMesh(gl, mesh);

// creating shader program using webgl-utils.js
var shaderprogram = webglUtils.createProgramFromScripts(gl, ["vertex-shader", "fragment-shader"]);
gl.useProgram(shaderprogram); // using the program

// TODO: associating attributes to vertex shader
var _Pmatrix = gl.getUniformLocation(shaderprogram, "u_Pmatrix");
var _Vmatrix = gl.getUniformLocation(shaderprogram, "u_Vmatrix");
var _Mmatrix = gl.getUniformLocation(shaderprogram, "u_Mmatrix");

// TODO: find an appropriate place
var _viewWorldPosition = gl.getUniformLocation(shaderprogram, "u_viewWorldPosition");
gl.uniform3fv(gl.getUniformLocation(shaderprogram, "u_lightDirection"), m4.normalize([-1, 3, 5]));

// looking for buffers location
var positionLocation = gl.getAttribLocation(shaderprogram, "a_position");
var normalLocation = gl.getAttribLocation(shaderprogram, "a_normal");
var texcoordLocation = gl.getAttribLocation(shaderprogram, "a_texcoord");

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

// setting material uniforms
gl.uniform3fv(gl.getUniformLocation(shaderprogram, "ambient"), ambient);
gl.uniform3fv(gl.getUniformLocation(shaderprogram, "diffuse"), diffuse);
gl.uniform3fv(gl.getUniformLocation(shaderprogram, "specular"), specular);
gl.uniform3fv(gl.getUniformLocation(shaderprogram, "emissive"), emissive);
gl.uniform1f(gl.getUniformLocation(shaderprogram, "shininess"), shininess);
gl.uniform1f(gl.getUniformLocation(shaderprogram, "opacity"), opacity);

// setting lights color
var ambientLight = [0.2, 0.2, 0.2];
var colorLight = [1.0, 1.0, 1.0]; // white
// setting light uniforms
gl.uniform3fv(gl.getUniformLocation(shaderprogram, "u_ambientLight"), ambientLight);
gl.uniform3fv(gl.getUniformLocation(shaderprogram, "u_colorLight"), colorLight);
// TODO: add light direction

// setting parameters to determine how to get data out of positionBuffer
var size = 3;
var type = gl.FLOAT;
var normalize = false;
var stride = 0;
var offset = 0;

// position location
gl.enableVertexAttribArray(positionLocation); // enabling position location
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer); // binding position buffer
gl.vertexAttribPointer(positionLocation, size, type, normalize, stride, offset);
// normal location
gl.enableVertexAttribArray(normalLocation);// enabling the normal attribute
gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
gl.vertexAttribPointer(normalLocation, size, type, normalize, stride, offset);
// texture coordinates location
gl.enableVertexAttribArray(texcoordLocation);
gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
size = 2;
gl.vertexAttribPointer(texcoordLocation, size, type, normalize, stride, offset);

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
var zoom_enabled = false;
var old_x, old_y;
var dX = 0, dY = 0;

// functions
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
    if(e.deltaY < 0 && D < max_D)
        D *= 1.1;
    else if (e.deltaY > 0 && D > min_D)
        D *= 0.9;
    //console.log("delta Y:"+ e.deltaY + " \tD:" + D);
    e.preventDefault();
};

// binding
canvas.onmousedown = mouseDown;
canvas.onmouseup = mouseUp;
canvas.onmouseout = mouseOut;
canvas.onmousemove = mouseMove;
canvas.onmouseover = mouseOver;
canvas.onwheel = onWheel;


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
    m4.scale(mo_matrix, D, D, D, mo_matrix);
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

    gl.uniform3fv(_viewWorldPosition, camera);

    // TODO: add buffers
    //gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);

    // drawing the scene
    //gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
    gl.drawArrays(gl.TRIANGLES, 0, numVertices);
    
    window.requestAnimationFrame(render); 
};

render(0);