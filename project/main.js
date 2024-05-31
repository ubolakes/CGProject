/*
Author: Umberto Laghi
E-mail: umberto.laghi@studio.unibo.it
Github: @ubolakes
*/

"use strict"; // necessary? what's the meaning

// range for zoom
const max_zoom = 1.5; // to be defined
const min_zoom = .5; // to be defined

var canvas = document.getElementById("canvas"); // getting canvas from HTML file
var gl = canvas.getContext("webgl"); // getting webgl context from canvas

// variables to save geometry of meshes
var staticMesh = new Array();
var staticMeshInfo;
var dynMesh = new Array();
var dynMeshInfo;

// adding dat.gui to the scene
window.onload = define_gui();

// setting path for required mesh
staticMesh.sourceMesh = 'data/boeing/boeing_3.obj'; // using test mesh imported from class
dynMesh.sourceMesh = 'data/ruota/ruota_davanti_gomma.obj';
// calling the LoadMesh function
staticMeshInfo = LoadMesh(gl, staticMesh);
dynMeshInfo = LoadMesh(gl, dynMesh);

// creating shader program using webgl-utils.js
var shaderprogram = webglUtils.createProgramFromScripts(gl, ["vertex-shader", "fragment-shader"]);
gl.useProgram(shaderprogram); // using the program

// attributes location
var positionLocation = gl.getAttribLocation(shaderprogram, "a_position");
var normalLocation = gl.getAttribLocation(shaderprogram, "a_normal");
var texcoordLocation = gl.getAttribLocation(shaderprogram, "a_texcoord");

// uniforms location
//vertex shader
var _Pmatrix = gl.getUniformLocation(shaderprogram, "u_Pmatrix");
var _Vmatrix = gl.getUniformLocation(shaderprogram, "u_Vmatrix");
var _Mmatrix = gl.getUniformLocation(shaderprogram, "u_Mmatrix");
var _viewWorldPosition = gl.getUniformLocation(shaderprogram, "u_viewWorldPosition");
var translationLocation = gl.getUniformLocation(shaderprogram, "u_translation");
// fragment shader
var ambientLocation = gl.getUniformLocation(shaderprogram, "u_ambient");
var diffuseLocation = gl.getUniformLocation(shaderprogram, "u_diffuse");
var specularLocation = gl.getUniformLocation(shaderprogram, "u_specular");
var emissiveLocation = gl.getUniformLocation(shaderprogram, "u_emissive");
var shininessLocation = gl.getUniformLocation(shaderprogram, "u_shininess");
var opacityLocation = gl.getUniformLocation(shaderprogram, "u_opacity");
var lightDirectionLocation = gl.getUniformLocation(shaderprogram, "u_lightDirection");
//, m4.normalize([-1, 3, 5])); to put in lightDirection uniform
var ambientLightLocation = gl.getUniformLocation(shaderprogram, "u_ambientLight");
var colorLightLocation = gl.getUniformLocation(shaderprogram, "u_colorLight");
var textureLocation = gl.getUniformLocation(shaderprogram, "u_texture");

// setting lights color
var ambientLight = [0.2, 0.2, 0.2];
// setting light uniforms
gl.uniform3fv(gl.getUniformLocation(shaderprogram, "u_ambientLight"), ambientLight);
// TODO: add light direction

// setting parameters to determine how to get data out of positionBuffer
var size = 3;
var type = gl.FLOAT;
var normalize = false;
var stride = 0;
var offset = 0;

// support functions
// TODO: move it to a more appropriate file or location
function degToRad(d){
    return d*Math.PI/180;
}

// defining projection matrix
var aspect = gl.canvas.clientWidth/gl.canvas.clientHeight;
var zNear = 1;
var zFar = 100;
var fov = degToRad(40);

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
gl.uniformMatrix4fv(_Vmatrix, false, view_matrix);

// mouse events management
var AMORTIZATION = 0.95;
var drag = false;
var zoom_enabled = false;
var old_x, old_y;
var dX = 0, dY = 0;

// binding events to handlers
canvas.onmousedown = mouseDown;
canvas.onmouseup = mouseUp;
canvas.onmouseout = mouseOut;
canvas.onmousemove = mouseMove;
canvas.onmouseover = mouseOver;
canvas.onwheel = onWheel;

// render function
var old_t = 0;
var rotationRadians = degToRad(0);
var rotationSpeed = 0;
var lightBrightness = 1.0;

var render = function(time) {
    time *= 0.001; // convert into seconds
    var dt = time - old_t; // computing delta time
    old_t = time;

    //TODO: parameter association to dat.gui parameters
    // this way the modification are applied instantly
    rotationSpeed = controls.rotationSpeed;
    lightBrightness = controls.lightBrightness;
    var colorLight = [1.0*lightBrightness, 1.0*lightBrightness, 1.0*lightBrightness];

    if(!drag) { // the scene is not being moved
        dX *= AMORTIZATION;
        dY *= AMORTIZATION;
        THETA += dX;
        PHI += dY;
    }

    // window to viewport transformation
    gl.viewport(0.0, 0.0, canvas.width, canvas.height); 
    
    // tests
    gl.enable(gl.DEPTH_TEST);
    // gl.depthFunc(gl.LEQUAL);
    
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    // changing matrix values according to the changes in camera params
    var mo_matrix = m4.identity();
    m4.yRotate(mo_matrix, THETA, mo_matrix);
    m4.xRotate(mo_matrix, PHI, mo_matrix);
    m4.scale(mo_matrix, 0.75, 0.75, 0.75, mo_matrix);
    
    /* in the render function the proj_matrix can be modified at runtime,
     giving the possibility to zoom in and out */
    var proj_matrix = m4.perspective(fov, aspect, zNear, zFar);

    // common uniforms
    gl.uniformMatrix4fv(_Pmatrix, false, proj_matrix); 
    gl.uniformMatrix4fv(_Vmatrix, false, view_matrix); 
    //gl.uniformMatrix4fv(_Mmatrix, false, mo_matrix);
    gl.uniform3fv(_viewWorldPosition, camera);
    gl.uniform3fv(colorLightLocation, colorLight);

    // creating buffers
    var positionBuffer = gl.createBuffer();
    var normalsBuffer = gl.createBuffer();
    var texcoordBuffer = gl.createBuffer();

    /*==== staticMesh ====*/
    // non-rotational matrix
    gl.uniformMatrix4fv(_Mmatrix, false, mo_matrix);

    // buffer binding
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(staticMeshInfo.positions), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(staticMeshInfo.normals), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(staticMeshInfo.texcoords), gl.STATIC_DRAW);

    // translation
    var tx = -1.5, ty = 0.0, tz =0.0;
    gl.uniform4f(translationLocation, tx, ty, tz, 0.0);

    // attributes management
    size = 3; // verify if it's necessary

    gl.enableVertexAttribArray(positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(positionLocation, size, type, normalize, stride, offset);

    gl.enableVertexAttribArray(normalLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
    gl.vertexAttribPointer(normalLocation, size, type, normalize, stride, offset);

    gl.enableVertexAttribArray(texcoordLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
    size = 2;
    gl.vertexAttribPointer(texcoordLocation, size, type, normalize, stride, offset);

    // setting uniforms
    gl.uniform3fv(ambientLocation, staticMeshInfo.ambient);
    gl.uniform3fv(diffuseLocation, staticMeshInfo.diffuse);
    gl.uniform3fv(specularLocation, staticMeshInfo.specular);
    gl.uniform3fv(emissiveLocation, staticMeshInfo.emissive);
    gl.uniform1f(shininessLocation, staticMeshInfo.shininess);
    gl.uniform1f(opacityLocation, staticMeshInfo.opacity);

    // setting the texture
    gl.uniform1i(textureLocation, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, staticMeshInfo.texture);

    // draw function
    gl.drawArrays(gl.TRIANGLES, 0, staticMeshInfo.numVertices);


    /*==== dynMesh ====*/
    // making this mesh rotate around one of its axes
    rotationRadians += rotationSpeed * dt;
    var rotationMatrix = m4.xRotate(mo_matrix, rotationRadians);
    gl.uniformMatrix4fv(_Mmatrix, false, rotationMatrix);
    
    // buffer binding
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(dynMeshInfo.positions), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(dynMeshInfo.normals), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(dynMeshInfo.texcoords), gl.STATIC_DRAW);

    // translation
    tx = 1.0, ty = 0.0, tz =0.0;
    gl.uniform4f(translationLocation, tx, ty, tz, 0.0);

    // attributes management
    size = 3;

    gl.enableVertexAttribArray(positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(positionLocation, size, type, normalize, stride, offset);

    gl.enableVertexAttribArray(normalLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
    gl.vertexAttribPointer(normalLocation, size, type, normalize, stride, offset);

    gl.enableVertexAttribArray(texcoordLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
    size = 2;
    gl.vertexAttribPointer(texcoordLocation, size, type, normalize, stride, offset);

    // setting uniforms
    gl.uniform3fv(ambientLocation, dynMeshInfo.ambient);
    gl.uniform3fv(diffuseLocation, dynMeshInfo.diffuse);
    gl.uniform3fv(specularLocation, dynMeshInfo.specular);
    gl.uniform3fv(emissiveLocation, dynMeshInfo.emissive);
    gl.uniform1f(shininessLocation, dynMeshInfo.shininess);
    gl.uniform1f(opacityLocation, dynMeshInfo.opacity);

    // setting the texture
    //gl.bindTexture(gl.TEXTURE_2D, null);
    gl.uniform1i(textureLocation, 1);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, dynMeshInfo.texture);

    // draw function
    gl.drawArrays(gl.TRIANGLES, 0, dynMeshInfo.numVertices);

    window.requestAnimationFrame(render); 
};

render(0);