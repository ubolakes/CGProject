/*
Author: Umberto Laghi
E-mail: umberto.laghi@studio.unibo.it
Github: @ubolakes
*/

/* this class represents the scene, it creates all that's necessary to get a screen output */

// TODO: add comments

class Scene {
    constructor(canvasId, jsonPath) {
        this.canvas = document.getElementById(canvasId);
        this.gl = this.canvas.getContext("webgl");
        this.gl.getExtension("OES_standard_derivatives");

        // checking if webgl is supported by browser
        if (!this.gl) {
            alert("WebGL not supported!\nUse a better browser :P");
            throw new Error("WebGL not supported!");
        }
        
        // checking if extension is supported by browser
        this.ext = this.gl.getExtension("WEBGL_depth_texture");
        if (!this.ext) {
            return alert("WEBGL_depth_texture not supported!\nUse a better browser");
        }

        this.path = jsonPath; // saving json path

        // tests
        this.gl.enable(this.gl.DEPTH_TEST);
        // creating base shader program
        this.program = webglUtils.createProgramInfo(this.gl, ["base-vertex-shader", "base-fragment-shader"]);

        // async loading skybox and shadows
        this.prepareSkybox().then(() => {});
        this.prepareShadows().then(() => {});

        // storing all meshes of the scene in array
        this.mesh_list = [];
        this.load_mesh(jsonPath).then(() => {});

        // creating a camera for the scene
        const position = [6, 0, 8];
        const target = [0, 0, 0];
        const up = [0, 1, 0];
        this.camera = new Camera(position, target, up);
        this.keys = {};
        
        // setting light position
        this.light = {
            position:   [6, 2, 3],
            direction:  [1, 1, 1],
            color:      [1.0, 1.0, 1.0], // white
            ambient:    [0.1, 0.1, 0.1]
        };
    }  

    // async function to load a list of meshes from json
    // for each mesh it creates a MeshObj object
    async load_mesh(jsonPath) {
        // waiting for the JSON to load
        const response = await fetch(jsonPath);
        const json = await response.json();

        // for each mesh it loads infos on an array
        json.meshes.forEach(obj => {
            if(obj.mirror) {
                this.mesh_list.push(new Mirror(obj, this.gl));
            } else {
                this.mesh_list.push(new MeshObj(obj, this.gl));
            }
        });
    }

    // function to compute the projection matrix
    projectionMatrix() {
        let fovRadians = degToRad(60);
        let aspect = this.gl.canvas.clientWidth / this.gl.canvas.clientHeight;
        let zmin = 0.1;
        return m4.perspective(fovRadians, aspect, zmin, 200);
    }

    // movement with keyboard
    // on a key click it calls the associated function to move the camera
    key_controller() {
        let step = 0.05;

        if (this.keys["w"]) { // forward
            this.camera.dolly(step);
        }
        if (this.keys["s"]) { // backward
            this.camera.dolly(-step);
        }
        if (this.keys["a"]) { //left
            this.camera.truck(-step);
        }
        if (this.keys["d"]) { // right
            this.camera.truck(step);
        }
        if (this.keys[" "]) { // up
            this.camera.pedestal(step);
        }
        if (this.keys["Control"]) { // down
            this.camera.pedestal(-step);
        }
        if (this.keys["ArrowUp"]) {
            this.camera.tilt(step);
        }
        if (this.keys["ArrowDown"]) {
            this.camera.tilt(-step);
        }
        if (this.keys["ArrowLeft"]) {
            this.camera.pan(step);
        }
        if (this.keys["ArrowRight"]) {
            this.camera.pan(-step);
        }
        if (this.keys["r"]) {
            this.camera.align();
        }
    }

    // async function to load the skybox
    // it used a cubemap texture
    async prepareSkybox() {
        this.skybox = [];
        this.skybox.programInfo = webglUtils.createProgramInfo(this.gl, ["skybox-vertex-shader", "skybox-fragment-shader"]);
        const arrays2 = createXYQuadVertices.apply(null, Array.prototype.slice.call(arguments, 1));
        this.skybox.quadBufferInfo = webglUtils.createBufferInfoFromArrays(this.gl, arrays2);
        this.skybox.texture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, this.skybox.texture);
        
        // loading skybox faces
        const faceInfos = [
            {
                target: this.gl.TEXTURE_CUBE_MAP_POSITIVE_X,
                url: "./data/skybox/posx.jpg"
            },
            {
                target: this.gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
                url: "./data/skybox/negx.jpg"
            },
            {
                target: this.gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
                url: "./data/skybox/posy.jpg"
            },
            {
                target: this.gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
                url: "./data/skybox/negy.jpg"
            },
            {
                target: this.gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
                url: "./data/skybox/posz.jpg"
            },
            {
                target: this.gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
                url: "./data/skybox/negz.jpg"
            }
        ];

        faceInfos.forEach((faceInfo) => {
            const {target, url} = faceInfo;

            const level = 0;
            const internalFormat = this.gl.RGBA;
            const width = 2048;
            const height = 2048;
            const format = this.gl.RGBA;
            const type = this.gl.UNSIGNED_BYTE;
            this.gl.texImage2D(
                target,
                level,
                internalFormat,
                width,
                height,
                0,
                format,
                type,
                null
            );

            const image = new Image();
            image.src = url;

            let gl = this.gl;
            let scene = this;

            image.addEventListener("load", function() {
                gl.bindTexture(gl.TEXTURE_CUBE_MAP, scene.skybox.texture);
                gl.texImage2D(
                    target,
                    level,
                    internalFormat,
                    format,
                    type,
                    image
                );
                gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
            });
        });
        this.gl.generateMipmap(this.gl.TEXTURE_CUBE_MAP);
        this.gl.texParameteri(this.gl.TEXTURE_CUBE_MAP, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_LINEAR);
    }


    // async function to load shadows
    async prepareShadows() {
        this.shadow = [];

        this.colorProgramInfo = webglUtils.createProgramInfo(this.gl, ['color-vertex-shader', 'color-fragment-shader']);
        this.textureProgramInfo = webglUtils.createProgramInfo(this.gl, ['shadow-vertex-shader', 'shadow-fragment-shader']);

        this.shadow.depthTexture = this.gl.createTexture();
        this.shadow.depthTextureSize = 4096;
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.shadow.depthTexture);
        this.gl.texImage2D(
            this.gl.TEXTURE_2D,
            0,
            this.gl.DEPTH_COMPONENT,
            this.shadow.depthTextureSize,
            this.shadow.depthTextureSize,
            0,
            this.gl.DEPTH_COMPONENT,
            this.gl.UNSIGNED_INT,
            null
        );
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);

        // creating frame for the shadows
        this.shadow.depthFrameBuffer = this.gl.createFramebuffer();
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.shadow.depthFrameBuffer);
        this.gl.framebufferTexture2D(
            this.gl.FRAMEBUFFER,
            this.gl.DEPTH_ATTACHMENT,
            this.gl.TEXTURE_2D,
            this.shadow.depthTexture,
            0
        );
        // shadow settings
        this.shadow.enable = false;
        this.shadow.fov = 60;
        this.shadow.projWidth = 2;
        this.shadow.projHeight = 2;
        this.shadow.zFarProj = 20;
        this.shadow.bias = -0.0001;
    }

    // enables/disables shadows
    toggle_shadows() {
        this.shadow.enable = !this.shadow.enable;
    }

    // reloads the scene
    async reload_scene() {
        this.mesh_list = [];
        await this.load_mesh(this.path);
    }

} // Scene class

// draws everything in the scene on the canvas
function draw() {
    // resizing canvas to window size
    resizeCanvasToDisplaySize(scene.gl.canvas);
    scene.gl.viewport(0, 0, scene.gl.canvas.width, scene.gl.canvas.height);
    scene.key_controller();

    scene.gl.enable(scene.gl.CULL_FACE);
    scene.gl.enable(scene.gl.DEPTH_TEST);
    scene.gl.enable(scene.gl.BLEND);
    scene.gl.blendFunc(scene.gl.SRC_ALPHA, scene.gl.ONE_MINUS_SRC_ALPHA);

    let proj = scene.projectionMatrix();
    let view = scene.camera.getViewMatrix();

    function bindFramebufferNull() {
        scene.gl.bindFramebuffer(scene.gl.FRAMEBUFFER, null);
        scene.gl.viewport(0, 0, scene.gl.canvas.width, scene.gl.canvas.height);
        scene.gl.clearColor(0, 0, 0, 1);
        scene.gl.clear(scene.gl.COLOR_BUFFER_BIT | scene.gl.DEPTH_BUFFER_BIT);
    }

    if (scene.shadow.enable) {
        const lightWorldMatrix = m4.lookAt(
            scene.light.position,
            scene.light.direction,
            [0, 1, 0]
        );

        const lightProjectionMatrix = m4.perspective(
            degToRad(scene.shadow.fov),
            scene.shadow.projWidth / scene.shadow.projHeight,
            0.5,
            scene.shadow.zFarProj
        );

        let sharedUniforms = {
            u_view: m4.inverse(lightWorldMatrix),
            u_projection: lightProjectionMatrix,
            u_bias: scene.shadow.bias,
            u_textureMatrix: m4.identity(),
            u_projectedTexture: scene.shadow.depthTexture, 
            u_reverseLightDirection: lightWorldMatrix.slice(8, 11)
        };

        // draw to the depth texture
        scene.gl.bindFramebuffer(scene.gl.FRAMEBUFFER, scene.shadow.depthFrameBuffer);
        scene.gl.viewport(0, 0, scene.shadow.depthTextureSize, scene.shadow.depthTextureSize);
        scene.gl.clear(scene.gl.COLOR_BUFFER_BIT | scene.gl.DEPTH_BUFFER_BIT);

        scene.mesh_list.forEach(m => {
            m.render(scene.gl, scene.colorProgramInfo, sharedUniforms);
        });

        bindFramebufferNull();

        let textureMatrix = m4.identity();
        textureMatrix = m4.translate(textureMatrix, 0.5, 0.5, 0.5);
        textureMatrix = m4.scale(textureMatrix, 0.5, 0.5, 0.5);
        textureMatrix = m4.multiply(textureMatrix, lightProjectionMatrix);
        textureMatrix = m4.multiply(
            textureMatrix,
            m4.inverse(lightWorldMatrix)
        );

        sharedUniforms = {
            u_view: scene.camera.getViewMatrix(),
            u_projection: proj,
            u_bias: scene.shadow.bias,
            u_textureMatrix: textureMatrix,
            u_projectedTexture: scene.shadow.depthTexture,
            u_reverseLightDirection: lightWorldMatrix.slice(8, 11),
            u_worldCameraPosition: scene.camera.getPosition()
        };

        scene.mesh_list.forEach(m => {
            m.render(scene.gl, scene.textureProgramInfo, sharedUniforms);
        });

    } else { // shadows not enabled 

        bindFramebufferNull();

        const sharedUniforms = {
            u_ambientLight: scene.light.ambient,
            u_lightDirection: m4.normalize(scene.light.direction),
            u_lightColor: scene.light.color,
            u_view: scene.camera.getViewMatrix(),
            u_projection: scene.projectionMatrix(),
            u_viewWorldPosition: scene.camera.getPosition(),
            u_lightPosition: scene.light.position
        };

        scene.mesh_list.forEach(m => {
            m.render(scene.gl, scene.program, sharedUniforms);
        });
    }

    // rendering skybox
    view[12] = 0;
    view[13] = 0;
    view[14] = 0;
    
    scene.gl.depthFunc(scene.gl.LEQUAL);
    scene.gl.useProgram(scene.skybox.programInfo.program);

    webglUtils.setBuffersAndAttributes(scene.gl, scene.skybox.programInfo, scene.skybox.quadBufferInfo);
    webglUtils.setUniforms(scene.skybox.programInfo, {
        u_viewDirectionProjectionInverse: m4.inverse(m4.multiply(proj, view)),
        u_skybx: scene.skybox.texture,
        u_lightColor: scene.light.color
    });
    webglUtils.drawBufferInfo(scene.gl, scene.skybox.quadBufferInfo);
    scene.gl.depthFunc(scene.gl.LESS);

    requestAnimationFrame(draw);

}