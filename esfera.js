var gBaloes = [];

class Esfera {
	constructor(
		ndivisoes = 0,
		initial_pos = vec3(0, 0, 0),
		vel = vec3(0, 0, 0),
		scale = 1.0,
		ambientColor = vec4(1.0, 1.0, 1.0, 1.0),
		diffuseColor = vec4(1.0, 1.0, 1.0, 1.0),
		shininess = 1.0
	) {
		this.pos = [];
		this.initial_pos = initial_pos;
		this.center = initial_pos;
		this.vel = vel;
		this.scale = scale;
		this.nor = [];
		this.ambientColor = ambientColor;
		this.diffuseColor = diffuseColor;
		this.shininess = shininess;
		this.axis = 0;
		this.rotacaoAngulo = vec3(0.0, 0.0, 0.0);
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
	}

	atualiza(delta) {
		const deltaSeg = delta / 1000.0;

		// Atualiza posição (apenas para cair)
		this.center[1] += this.vel[1] * deltaSeg;

		// Move o balão para o chão se atravessar o limite
		if (this.center[1] > BOLHA_MAX_POS) {
			this.center[1] = BOLHA_MIN_POS;
		}

		// Atualiza rotação
		const velRotacao = 1.0;
		this.rotacaoAngulo[this.axis] += velRotacao * deltaSeg;
	}

	renderiza() {
		gl.bindVertexArray(this.vao);

		// Translação
		const translation = mat4();
		translation[0][3] = this.center[0];
		translation[1][3] = this.center[1];
		translation[2][3] = this.center[2];
		translation[3][3] = 1.0;

		// Rotação
		const rx = rotateX(this.rotacaoAngulo[0]);
		const ry = rotateY(this.rotacaoAngulo[1]);
		const rz = rotateZ(this.rotacaoAngulo[2]);
		const rotation = mult(rz, mult(ry, rx));

		// Escala
		const scale = mat4();
		scale[0][0] = this.scale;
		scale[1][1] = this.scale;
		scale[2][2] = this.scale;
		scale[3][3] = 1.0;

		// Cor
		gl.uniform4fv(uAmbientColor, mult(LUZ.ambientColor, this.ambientColor));
		gl.uniform4fv(uDiffuseColor, mult(LUZ.diffuseColor, this.diffuseColor));
		gl.uniform4fv(uLightPos, LUZ.position);
		gl.uniform4fv(uSpecularColor, LUZ.specularColor);
		gl.uniform1f(uShininess, this.shininess);

		// Matriz model
		let modelMatrix = mult(translation, rotation);
		modelMatrix = mult(modelMatrix, scale);

		// Matriz view
		viewMatrix = gNail.getViewMatrix();
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
		let normal = vec3(cross(v1, v2));

		let center = vec3(
			(a[0] + b[0] + c[0]) / 3.0,
			(a[1] + b[1] + c[1]) / 3.0,
			(a[2] + b[2] + c[2]) / 3.0
		);
		if (dot(normal, center) < 0) {
			normal = negate(normal);
		}

		this.nor.push(normal, normal, normal);
	}
}
