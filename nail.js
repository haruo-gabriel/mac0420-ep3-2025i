var gNail;

class Nail {
    constructor() {
        this.position = vec3(0, 0, 3); // Camera position in world space
        this.worldUp = vec3(0, 1, 0);  // Fixed up vector
        
        // Camera orientation in Euler angles (in radians)
        this.yaw = -Math.PI / 2;        // Horizontal angle (initially looking along -z)
        this.pitch = 0;                 // Vertical angle
        this.roll = 0;                  // Roll around view direction
        
        // Movement and rotation speeds
        this.vel = 0.0;
        
        // Perspective settings
        this.fovy = 45.0;
        this.aspect = 1.0;
        this.near = 1;
        this.far = 2000;
        
        // Calculate initial camera vectors
        this.atualizaCameraVectors();
    }

    atualizaVel(increment) {
        if (increment === 0.0) {
            this.vel = 0;
        } else {
            this.vel += increment;
            if (this.vel > NAIL_MAX_VEL) this.vel = NAIL_MAX_VEL;
            if (this.vel < NAIL_MIN_VEL) this.vel = NAIL_MIN_VEL;
        }
        console.log("Velocidade da agulha: ", this.vel);
    }

    atualizaCameraVectors() {
        // Calculate front vector from yaw and pitch
        this.front = vec3(
            Math.cos(this.yaw) * Math.cos(this.pitch),
            Math.sin(this.pitch),
            Math.sin(this.yaw) * Math.cos(this.pitch)
        );
        this.front = normalize(this.front);
        
        // Calculate right and up vectors
        this.right = normalize(cross(this.front, this.worldUp));
        this.up = normalize(cross(this.right, this.front));
        
        // Calculate the target/center point based on position and front direction
        this.center = add(this.position, this.front);
        
        // Apply roll if needed
        if (this.roll !== 0) {
            const rollMat = rotate(this.roll * 180 / Math.PI, this.front);
            const rolledUp = mult(rollMat, vec4(this.up[0], this.up[1], this.up[2], 0.0));
            this.up = vec3(rolledUp[0], rolledUp[1], rolledUp[2]);
        }
    }

    // Rotate horizontally (around world up axis)
    rotacionaYaw(angle) {
        this.yaw += angle;
        this.atualizaCameraVectors();
    }

    // Rotate vertically (around right axis)
    rotacionaPitch(angle) {
        // Limit pitch to avoid gimbal lock
        this.pitch = Math.max(Math.min(this.pitch + angle, Math.PI/2 - 0.01), -Math.PI/2 + 0.01);
        this.atualizaCameraVectors();
    }

	rotacionaRoll(angle) {
		this.roll += angle;
		if (this.roll >= Math.PI / 2) {
			this.roll = Math.PI / 2;
		} else if (this.roll <= -Math.PI / 2) {
			this.roll = -Math.PI / 2;
		}
		this.atualizaCameraVectors();
	}

    moveForward() {
        // Only move if velocity isn't zero
        if (this.vel !== 0) {
            // Calculate movement vector based on current direction
            let movement = scale(this.vel, this.front);
            
            // Update camera position
            this.position = add(this.position, movement);
            
            // Update camera vectors to reflect the new position
            this.atualizaCameraVectors();
        }
    }

    getViewMatrix() {
        return lookAt(this.position, this.center, this.up);
    }
}