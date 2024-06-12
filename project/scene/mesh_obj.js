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
            this.angle = 0;
        }

        this.ready = false;

        LoadMesh(gl, this.mesh).then(() => {
            this.prepare_mesh(gl).then(() => {})
            this.ready = true;
        })
    }

    // this function loads mesh data and puts them in buffers to be loaded into vertex shader 
    async prepare_mesh(gl){
        // generic material
        const defaultMaterial = {
            // default parameters
            diffuse: [1, 1, 1],
            diffuseMap: this.mesh.textures.defaultWhite,
            ambient: [0, 0, 0],
            specular: [1, 1, 1],
            shininess: 400,
            opacity: 1
        };

        // moving to initial location
        let x = this.position[0];
        let y = this.position[1];
        let z = this.position[2];

        // moving meshes to initial location
        this.mesh.data.geometries.forEach( geometry => {
            for (let i = 0; i < geometry.data.position.length; i +=3) {
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
                data.color = {value: [1, 1, 1, 1]};
            }
            // creating buffers and associating data
            const bufferInfo = webglUtils.createBufferInfoFromArrays(gl, data);
            return {
                material: {
                    ...defaultMaterial,
                    ...this.mesh.materials[material]
                },
                bufferInfo,
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
        let world_matrix = m4.identity();

        if(this.rotate === true && uniforms.textureMatrix !== m4.identity()) {
            world_matrix = m4.yRotate(world_matrix, degToRad(this.angle));
            this.angle = this.angle === 360 ? 0 : this.angle + 5;
        }

        for (const {bufferInfo, material} of this.mesh.parts) {
            // calls gl.bindbuffer, gl.enableVertexAttribArray, gl.vertexAttribPointer
            // to pass attributes pointer to vertex shader
            webglUtils.setBuffersAndAttributes(gl, programInfo, bufferInfo);
            // calls gl.uniform to pass values to shadere
            webglUtils.setUniforms(programInfo, { world_matrix }, material);
            // calls the gl.drawArrays to draw the scene
            webglUtils.drawBufferInfo(gl, bufferInfo);
        }
    }
}