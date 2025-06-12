var gBaloes = [];

class Esfera {
	constructor(ndivisoes = 0) {
		this.pos = [];
		this.nor = [];
		this.axis = 0;
		this.theta = vec3(0.0, 0.0, 0.0);
		this.color = [];
		this.paused = false;
		this.vao = gl.createVertexArray();

		const vp = [
			// Vértices positivos
			vec3(1.0, 0.0, 0.0),
			vec3(0.0, 1.0, 0.0),
			vec3(0.0, 0.0, 1.0),
		];
		const vn = [
			// Vértices negativos
			vec3(-1.0, 0.0, 0.0),
			vec3(0.0, -1.0, 0.0),
			vec3(0.0, 0.0, -1.0),
		];
		const triangulo = [
			[vp[0], vp[1], vp[2]],
			[vp[0], vp[1], vn[2]],
			[vp[0], vn[1], vp[2]],
			[vp[0], vn[1], vn[2]],
			[vn[0], vp[1], vp[2]],
			[vn[0], vp[1], vn[2]],
			[vn[0], vn[1], vp[2]],
			[vn[0], vn[1], vn[2]],
		];

		// Divisão dos triângulos
		for (let i = 0; i < triangulo.length; i++) {
			let a, b, c;
			[a, b, c] = triangulo[i];
			this.dividaTriangulo(a, b, c, ndivisoes);
		}

		console.log(triangulo);
	}

	bindBuffers() {
		gl.bindVertexArray(this.vao);

		// Buffer de normais
		gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
		gl.bufferData(gl.ARRAY_BUFFER, flatten(this.nor), gl.STATIC_DRAW);
		const norLoc = gl.getAttribLocation(program, "aNormal");
		gl.vertexAttribPointer(norLoc, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(norLoc);

		// Buffer de posições
		gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
		gl.bufferData(gl.ARRAY_BUFFER, flatten(this.pos), gl.STATIC_DRAW);
		const posLoc = gl.getAttribLocation(program, "aPosition");
		gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(posLoc);

		// Buffer de cores
		// gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
		// gl.bufferData(gl.ARRAY_BUFFER, flatten(this.color), gl.STATIC_DRAW);
		// const colorLoc = gl.getAttribLocation(program, "aColor");
		// gl.vertexAttribPointer(colorLoc, 3, gl.FLOAT, false, 0, 0);
		// gl.enableVertexAttribArray(colorLoc);
	}

	renderiza() {
		gl.bindVertexArray(this.vao);

		if (!this.paused) this.theta[this.axis] += 1.0;

		// Rotação
		const rx = rotateX(this.theta[0]);
		const ry = rotateY(this.theta[1]);
		const rz = rotateZ(this.theta[2]);
		const rotation = mult(rz, mult(ry, rx));

		// Translação
		// const translation = translate(this.center);

		// Matriz model
		// const modelMatrix = mult(translation, rotation);
		const modelMatrix = rotation;

		// Matriz view
		const r = gNail.raio;
		const theta = gNail.theta;
		const pho = gNail.pho;
		const eye = vec3(
			r * Math.sin(theta) * Math.cos(pho),
			r * Math.sin(pho),
			r * Math.cos(theta) * Math.cos(pho)
		);
		viewMatrix = lookAt(eye, gNail.at, gNail.up);
		gl.uniformMatrix4fv(uView, false, flatten(viewMatrix));

		const modelViewMatrix = mult(viewMatrix, modelMatrix);
		const inverseTransposeModel = transpose(inverse(modelViewMatrix));

		gl.uniformMatrix4fv(uModel, false, flatten(modelMatrix));
		gl.uniformMatrix4fv(
			uInverseTransposeModel,
			false,
			flatten(inverseTransposeModel)
		);

		gl.drawArrays(gl.TRIANGLES, 0, this.pos.length);

		gl.bindVertexArray(null);
	}

	dividaTriangulo(a, b, c, ndivs) {
		if (ndivs > 0) {
			// Caso recursivo
			let ab = mix(a, b, 0.5);
			let bc = mix(b, c, 0.5);
			let ca = mix(c, a, 0.5);

			ab = normalize(ab);
			bc = normalize(bc);
			ca = normalize(ca);

			this.dividaTriangulo(a, ab, ca, ndivs - 1);
			this.dividaTriangulo(b, bc, ab, ndivs - 1);
			this.dividaTriangulo(c, ca, bc, ndivs - 1);
			this.dividaTriangulo(ab, bc, ca, ndivs - 1);
		} else {
			// Caso base
			this.insiraTriangulo(a, b, c);
		}
	}

	insiraTriangulo(a, b, c) {
		this.pos.push(a);
		this.pos.push(b);
		this.pos.push(c);

		// Normal do triângulo
		const v1 = subtract(b, a);
		const v2 = subtract(c, a);
		const normal = vec3(cross(v1, v2));

		this.nor.push(normal, normal, normal);
	}
}
