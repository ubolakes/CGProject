class Camera {
    constructor(pos, lookAt, up){
        this.position = pos;
        this.forward = m4.normalize(m4.subtractVectors(lookAt, pos));
        this.right = m4.normalize(m4.cross(this.forward, up));
        this.up = m4.normalize(m4.cross(this.right, this.forward));
    }

    // rotates about camera u axis
    tilt(step){
        let rotation = m4.axisRotation(this.right, (step / 2));
        this.forward = m4.transformPoint(rotation, this.forward);
        this.up = m4.transformPoint(rotation, this.up);

        this.forward = m4.normalize(this.forward);
        this.up = m4.normalize(this.up);
    }

    // rotates camera view horizontally
    pan(step){
        let rotation = m4.axisRotation(this.up, step);
        this.forward = m4.transformPoint(rotation, this.forward);
        this.right = m4.transformPoint(rotation, this.right);

        this.forward = m4.normalize(this.forward);
        this.right = m4.normalize(this.right);
    }

    // tilt camers sideways
    cant(step){
        let rotation = m4.axisRotation(this.forward, (step/2));
        this.right = m4.transformPoint(rotation, this.right);
        this.up = m4.transformPoint(rotation, this.up);

        this.right = m4.normalize(this.right);
        this.up = m4.normalize(this.up);
    }

    // moves camera left or right
    truck(dist){
        this.position[0] += + (this.right[0] * dist); 
        this.position[1] += + (this.right[1] * dist);
        this.position[2] += + (this.right[2] * dist);
    }

    // moves camera up or down
    pedestal(dist){
        this.position[0] += + (this.up[0] * dist);
        this.position[1] += + (this.up[1] * dist);
        this.position[2] += + (this.up[2] * dist);
    }

    // moves camera closer or further from the scene
    dolly(dist){
        this.position[0] += (this.forward[0] * dist);
        this.position[1] += (this.forward[1] * dist);
        this.position[2] += (this.forward[2] * dist);
    }

    // realigns the camera
    align(){
        this.up = [0, 1, 0];
        this.forward[1] = 0;
        this.right = m4.normalize(m4.cross(this.forward, this.up));
    }

    // returns the viewmatrix
    getViewMatrix(){
        const look = m4.addVectors(this.position, this.forward);
        return m4.inverse(m4.lookAt(this.position, look, this.up));
    }

    // returns lookAt
    getLookAt(){
        const look = m4.addVectors(this.position, this.forward);
        return m4.lookAt(this.position, look, this.up);
    }

    // returns this.position
    getPosition(){
        return this.position;
    }

}