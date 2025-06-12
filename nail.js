var gNail;

class Nail {
	constructor() {
		this.pos = vec3(150, 150, 150);
		this.at = vec3(0, 0, 0);
		this.up = vec3(0, 1, 0);
		this.fovy = 45.0;
		this.aspect = 1.0;
		this.near = 1;
		this.far = 2000;
		this.vtrans = 1;
		this.theta = vec3(45, -45, 0);
		this.raio = 3;
		this.theta = 0;
		this.pho = 0;
		this.roll = 0;
		this.step = Math.PI / 18; // em radianos
	}

    getViewMatrix() {
        const eye = vec3(
            this.raio * Math.sin(this.theta) * Math.cos(this.pho),
            this.raio * Math.sin(this.pho),
            this.raio * Math.cos(this.theta) * Math.cos(this.pho)
        );

		// Rotação no próprio eixo
        const rollMatrix = rotateZ((this.roll * 180) / Math.PI);
        const rolledUp = mult(
            rollMatrix,
            vec4(this.up[0], this.up[1], this.up[2], 0.0)
        );
        const upVector = vec3(rolledUp[0], rolledUp[1], rolledUp[2]);

        return lookAt(eye, this.at, upVector);
    }
}
