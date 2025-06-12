"use strict";

window.onload = main;

function main() {
	canvas = document.querySelector("#glcanvas");
	gl = canvas.getContext("webgl2");

	if (!gl) {
		console.error("WebGL2 not supported, using WebGL");
		return;
	}

	gNail = new Nail();

	for (let i = 0; i < BOLHA_NUMERO; i++) {
		const ndivisoes = randomRange(BOLHA_MIN_RESOLUCAO, BOLHA_MAX_RESOLUCAO);
		const initial_pos = vec3(
			randomRange(BOLHA_MIN_POS, BOLHA_MAX_POS),
			randomRange(BOLHA_MIN_POS, BOLHA_MAX_POS),
			randomRange(BOLHA_MIN_POS, BOLHA_MAX_POS),
		);
		const vel = vec3(
			randomRange(BOLHA_MIN_VEL, BOLHA_MAX_VEL),
			randomRange(BOLHA_MIN_VEL, BOLHA_MAX_VEL),
			randomRange(BOLHA_MIN_VEL, BOLHA_MAX_VEL),
		);
		const scale = randomRange(BOLHA_MIN_RAIO, BOLHA_MAX_RAIO);
		gBaloes.push(new Esfera(ndivisoes, initial_pos, vel, scale));
	}

	criaShaders();

	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.enable(gl.DEPTH_TEST);

	criaInterface();

	renderizaCena();
}

function criaInterface() {
	document.getElementById("bRun").onclick = () => {};

	document.getElementById("bStep").onclick = () => {};
}

function criaShaders() {
	program = makeProgram(gl, vertexShaderSource, fragmentShaderSource);
	gl.useProgram(program);

	for (let i = 0; i < gBaloes.length; i++) {
		gBaloes[i].bindBuffers();
	}

	// Uniformes
	uModel = gl.getUniformLocation(program, "uModel");
	uView = gl.getUniformLocation(program, "uView");
	uPerspective = gl.getUniformLocation(program, "uPerspective");
	uInverseTransposeModel = gl.getUniformLocation(
		program,
		"uInverseTransposeModel"
	);

	// Matriz perspectiva
	perspectiveMatrix = perspective(gNail.fovy, gNail.aspect, gNail.near, gNail.far);
	gl.uniformMatrix4fv(uPerspective, false, flatten(perspectiveMatrix));

	// Parâmetros de luz
	uLightPos = gl.getUniformLocation(program, "uLightPos");
	uAmbientColor = gl.getUniformLocation(program, "uAmbientColor");
	uDiffuseColor = gl.getUniformLocation(program, "uDiffuseColor");
	uSpecularColor = gl.getUniformLocation(program, "uSpecularColor");
	uShininess = gl.getUniformLocation(program, "uShininess");

	gl.uniform4fv(uLightPos, LUZ.position);
	gl.uniform4fv(uAmbientColor, mult(LUZ.ambientColor, MATERIAL.ambientColor));
	gl.uniform4fv(uDiffuseColor, mult(LUZ.diffuseColor, MATERIAL.diffuseColor));
	gl.uniform4fv(uSpecularColor, LUZ.specularColor);
	gl.uniform1f(uShininess, MATERIAL.shininess);
}

function renderizaCena() {
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	for (let i = 0; i < gBaloes.length; i++) {
		gBaloes[i].renderiza();
	}

	window.requestAnimationFrame(renderizaCena);
}

window.onkeydown = function (event) {
	switch (event.key) {
		case "ArrowUp":
			gNail.pho = Math.min(gNail.pho + gNail.step, Math.PI / 2);
			break;
		case "ArrowDown":
			gNail.pho = Math.max(gNail.pho - gNail.step, -Math.PI / 2);
			break;
		case "ArrowLeft":
			gNail.theta = Math.max(gNail.theta - gNail.step, -Math.PI);
			break;
		case "ArrowRight":
			gNail.theta = Math.min(gNail.theta + gNail.step, Math.PI);
			break;
	}
};

const vertexShaderSource = `#version 300 es
in vec3 aPosition;
in vec3 aNormal;

uniform mat4 uModel;
uniform mat4 uView;
uniform mat4 uPerspective;
uniform mat4 uInverseTransposeModel;
uniform vec4 uLightPos;

out vec3 vNormal;
out vec3 vLight;
out vec3 vView;

void main() {
    mat4 modelView = uView * uModel;
    vec4 aPosition = vec4(aPosition, 1.0);
    gl_Position = uPerspective * modelView * aPosition;

    vNormal = mat3(uInverseTransposeModel) * aNormal;
    vec4 pos = modelView * aPosition;
    vLight = mat3(uView) * (uLightPos.xyz - pos.xyz);
    vView = mat3(uView) * (normalize(-pos.xyz));
}
`;

const fragmentShaderSource = `#version 300 es
precision highp float;

in vec3 vNormal;
in vec3 vLight;
in vec3 vView;

uniform vec4 uAmbientColor;
uniform vec4 uDiffuseColor;
uniform vec4 uSpecularColor;
uniform float uShininess;

out vec4 outColor;

void main() {
    vec3 normal = normalize(vNormal);
    vec3 light = normalize(vLight);
    vec3 view = normalize(vView);
    vec3 halfVector = normalize(light + view);

    float kd = max(dot(normal, light), 0.0);
    vec4 diffuse = kd * uDiffuseColor;

    float ks = pow(max(dot(normal, halfVector), 0.0), uShininess);
    vec4 specular = vec4(0.0, 0.0, 0.0, 1.0);
    if (kd > 0.0) {
        specular = ks * uSpecularColor;
    }

    vec4 ambient = uAmbientColor;

    outColor = ambient + diffuse + specular;
}
`;
