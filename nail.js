var gNail;

class Nail {
	constructor() {
		this.pos    = vec3(150, 150, 150);
		this.at     = vec3(0, 0, 0);
		this.up     = vec3(0, 1, 0);
		this.fovy   = 45.0;
		this.aspect = 1.0;
		this.near   = 1;
		this.far    = 2000;
		this.vtrans = 1;
		this.theta  = vec3(45, -45, 0);
	}
}
