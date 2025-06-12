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
			randomRange(BOLHA_MIN_POS, BOLHA_MAX_POS)
		);
		const vel = vec3(
			randomRange(BOLHA_MIN_VEL, BOLHA_MAX_VEL),
			randomRange(BOLHA_MIN_VEL, BOLHA_MAX_VEL),
			randomRange(BOLHA_MIN_VEL, BOLHA_MAX_VEL)
		);
		const scale = randomRange(BOLHA_MIN_RAIO, BOLHA_MAX_RAIO);
		const ambientColor = vec4(
			randomRange(0, 1.0),
			randomRange(0, 1.0),
			randomRange(0, 1.0),
			randomRange(BOLHA_PHONG_ALFA_MIN, BOLHA_PHONG_ALFA_MAX)
		);
		const diffuseColor = vec4(
			randomRange(0, 1.0),
			randomRange(0, 1.0),
			randomRange(0, 1.0),
			randomRange(BOLHA_PHONG_ALFA_MIN, BOLHA_PHONG_ALFA_MAX)
		);
		const shininess = randomRange(0, 1.0);

		gBaloes.push(
			new Esfera(
				ndivisoes,
				initial_pos,
				vel,
				scale,
				ambientColor,
				diffuseColor,
				shininess
			)
		);
	}

	criaShaders();

	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.enable(gl.DEPTH_TEST);

	criaInterface();

	atualizaCena();

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
	perspectiveMatrix = perspective(
		gNail.fovy,
		gNail.aspect,
		gNail.near,
		gNail.far
	);
	gl.uniformMatrix4fv(uPerspective, false, flatten(perspectiveMatrix));

	// Parâmetros de iluminação
	uLightPos = gl.getUniformLocation(program, "uLightPos");
	uAmbientColor = gl.getUniformLocation(program, "uAmbientColor");
	uDiffuseColor = gl.getUniformLocation(program, "uDiffuseColor");
	uSpecularColor = gl.getUniformLocation(program, "uSpecularColor");
	uShininess = gl.getUniformLocation(program, "uShininess");
}

function atualizaCena() {
	for (let balao of gBaloes) {
		balao.atualiza();
	}
}

function renderizaCena() {
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	for (let balao of gBaloes) {
		balao.atualiza();
		balao.renderiza();
	}

	window.requestAnimationFrame(renderizaCena);
}

window.onkeydown = function (event) {
	switch (event.key) {
		// Comandos de translação da câmera
		case "j": // Diminui a velocidade de translação
			break;
		case "k": // Zera a velocidade de translação
			break;
		case "l": // Aumenta a velocidade de translação
			break;

		// Comandos de rotação da câmera
		case "x": // Gira para cima
			gNail.pho = Math.min(gNail.pho + gNail.step, Math.PI / 2);
			break;
		case "w": // Gira para baixo
			gNail.pho = Math.max(gNail.pho - gNail.step, -Math.PI / 2);
			break;
		case "a": // Gira para esquerda
			gNail.theta = Math.max(gNail.theta - gNail.step, -Math.PI / 2);
			break;
		case "d": // Gira para direita
			gNail.theta = Math.min(gNail.theta + gNail.step, Math.PI / 2);
			break;
		case "z": // Gira no próprio eixo no sentido horário
			gNail.roll = Math.min(gNail.roll + gNail.step, Math.PI / 2);
			break;
		case "c": // Gira no próprio eixo no sentido anti-horário
			gNail.roll = Math.max(gNail.roll - gNail.step, -Math.PI / 2);
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
