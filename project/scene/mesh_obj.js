/*
Author: Umberto Laghi
E-mail: umberto.laghi@studio.unibo.it
Github: @ubolakes
*/

/*  this class represent a mesh, it presents methods to load data from memory and render 
    using a shaderProgram */

class MeshObj {
    constructor(obj, gl){
        this.name = obj.name;
        this.obj_source = obj.obj_source;
        this.mtl_source = obj.mtl_source;
        this.position = obj.position;

        this.mesh = [];
        this.mesh.sourceMesh = this.obj_source;
        this.mesh.fileMTL = this.mtl_source;

        if (obj.rotate){
            this.rotate = obj.rotate;
            this.axis = obj.axis;
            this.angle = 0;
        }

        this.ready = false;

        LoadMesh(gl, this.mesh).then(() => {
            this.prepareMesh(gl).then(() => {});
            this.ready = true;
        });
    }

    // this function loads mesh data and puts them in buffers to be loaded into vertex shader 
    async prepareMesh(gl){
        // generic material
        const defaultMaterial = {
            // default parameters
            u_diffuse: [1, 1, 1],
            u_diffuseMap: this.mesh.textures.defaultWhite,
            u_ambient: [0, 0, 0],
            u_specular: [1, 1, 1],
            u_shininess: 400,
            u_opacity: 1
        };

        // moving to initial location
        let x = this.position[0];
        let y = this.position[1];
        let z = this.position[2];

        // moving meshes to initial location
        this.mesh.data.geometries.forEach( geometry => {
            for (let i = 0; i < geometry.data.position.length; i += 3) {
                geometry.data.position[i] += (y);
                geometry.data.position[i+1] += (z);
                geometry.data.position[i+2] += (x);
            }
        });

        // setting meshes colors
        this.mesh.parts = this.mesh.data.geometries.map(({material, data}) => {
            if (data.color) {
                if (data.position.length === data.color.length) {
                    data.color = { numComponents: 3, data: data.color };
                }
            } else {
                data.color = { value: [1, 1, 1, 1] };
            }
            // creating buffers and associating data
            const bufferInfo = webglUtils.createBufferInfoFromArrays(gl, data);
            return {
                material: {
                    ...defaultMaterial,
                    ...this.mesh.materials[material]
                },
                bufferInfo
            };
        });
    }

    /* render function */
    /* 
    takes in input:
        - gl context
        - programInfo -> contains all the shaders inputs location
        - uniforms -> they are passed to the shaders
    */
    render(gl, programInfo, uniforms) {
        if(!this.ready) return; // async funcs not completed

        // using shader program
        gl.useProgram(programInfo.program);
        // passing uniforms
        webglUtils.setUniforms(programInfo, uniforms);

        // computing world matrix
        let u_world = m4.identity();

        // mesh rotation management
        if (this.rotate === true && uniforms.textureMatrix !== m4.identity()) {
            // axis rotation management
            switch (this.axis){
                case "x": // around x
                    u_world = m4.xRotate(u_world, degToRad(this.angle));
                    this.angle = this.angle === 360 ? 0 : this.angle + 10;
                break;
                case "y": // around y
                    u_world = m4.yRotate(u_world, degToRad(this.angle));
                    this.angle = this.angle === 360 ? 0 : this.angle + 1.5;
                break;
                case "z": // around z
                    u_world = m4.zRotate(u_world, degToRad(this.angle));
                    this.angle = this.angle === 360 ? 0 : this.angle + 2;
                break;
                default: // notify error
                    console.log("Non existent axis! Try with lower case letter");
                break;
            }
        }

        for (const {bufferInfo, material} of this.mesh.parts) {
            // calls gl.bindbuffer, gl.enableVertexAttribArray, gl.vertexAttribPointer
            // to pass attributes pointer to vertex shader
            webglUtils.setBuffersAndAttributes(gl, programInfo, bufferInfo);
            // calls gl.uniform to pass values to shadere
            webglUtils.setUniforms(programInfo, { u_world }, material);
            // calls the gl.drawArrays to draw the scene
            webglUtils.drawBufferInfo(gl, bufferInfo);
        }
    }
} // MeshObj class