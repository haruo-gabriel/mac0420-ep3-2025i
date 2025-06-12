var gNail;

class Nail {
    constructor() {
		// Posição da câmera no espaço global
        this.position = vec3(0, 0, 3);

        this.worldUp = vec3(0, 1, 0);
        
        // Ângulos de rotação de câmera (radianos) 
        this.yaw = -Math.PI / 2;
        this.pitch = 0;
        this.roll = 0;
        
        // Velocidade de translação
        this.vel = 0.0;
        
        // Parâmetros de perspectiva
        this.fovy = 45.0;
        this.aspect = 1.0;
        this.near = 1;
        this.far = 2000;
        
        this.atualizaCamera();
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

    atualizaCamera() {
        this.at = vec3(
            Math.cos(this.yaw) * Math.cos(this.pitch),
            Math.sin(this.pitch),
            Math.sin(this.yaw) * Math.cos(this.pitch)
        );
        this.at = normalize(this.at);
        
        this.right = normalize(cross(this.at, this.worldUp));
        this.up = normalize(cross(this.right, this.at));
        
        this.center = add(this.position, this.at);
        
        if (this.roll !== 0) {
            const rollMat = rotate(this.roll * 180 / Math.PI, this.at);
            const rolledUp = mult(rollMat, vec4(this.up[0], this.up[1], this.up[2], 0.0));
            this.up = vec3(rolledUp[0], rolledUp[1], rolledUp[2]);
        }
    }

    rotacionaYaw(angle) {
        this.yaw += angle;
        this.atualizaCamera();
    }

    rotacionaPitch(angle) {
        this.pitch = Math.max(Math.min(this.pitch + angle, Math.PI/2 - 0.01), -Math.PI/2 + 0.01);
        this.atualizaCamera();
    }

	rotacionaRoll(angle) {
		this.roll += angle;
		if (this.roll >= Math.PI / 2) {
			this.roll = Math.PI / 2;
		} else if (this.roll <= -Math.PI / 2) {
			this.roll = -Math.PI / 2;
		}
		this.atualizaCamera();
	}

    moveForward() {
        if (this.vel !== 0) {
			// Calcula o vetor de deslocamento
            let movement = scale(this.vel, this.at);
            
            // Atualiza a posição da câmera
            this.position = add(this.position, movement);
            
            this.atualizaCamera();
        }
    }

    getViewMatrix() {
        return lookAt(this.position, this.center, this.up);
    }
}