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

	gTempoAnterior = gTempoAtual = Date.now();
	renderizaCena();
}

function criaInterface() {
	document.getElementById("bRun").onclick = () => {
		gPaused = !gPaused;

		if (gPaused) {
			document.getElementById("bRun").value = "Executar";
		} else {
			document.getElementById("bRun").value = "Pausar";
		}
	};

	document.getElementById("bStep").onclick = () => {
		if (gPaused) {
			const delta = 100.0;
			gNail.moveForward(delta);

			for (let balao of gBaloes) {
				balao.atualiza(delta);
			}
		}
	};

	window.onkeydown = function (event) {
		switch (event.key) {
			// Controle de velocidade da câmera
			case "j":
				gNail.atualizaVel(-NAIL_VEL_INCREMENT);
				break;
			case "k":
				gNail.atualizaVel(0.0);
				break;
			case "l":
				gNail.atualizaVel(+NAIL_VEL_INCREMENT);
				break;

			// Controle de rotação da câmera
			case "s":
				gNail.pitch = 0.0;
				gNail.yaw = 0.0;
				gNail.roll = 0.0;
				break;
			case "d": // Rotaciona pra esquerda
				gNail.rotacionaYaw(+NAIL_ROT_INCREMENT);
				break;
			case "a": // Rotaciona pra direita
				gNail.rotacionaYaw(-NAIL_ROT_INCREMENT);
				break;
			case "w": // Rotaciona pra cima
				gNail.rotacionaPitch(NAIL_ROT_INCREMENT);
				break;
			case "x": // Rotaciona pra baixo
				gNail.rotacionaPitch(-NAIL_ROT_INCREMENT);
				break;
			case "z": // Rotaciona em sentido horário
				gNail.rotacionaRoll(NAIL_ROT_INCREMENT);
				break;
			case "c": // Rotaciona em sentido anti-horário
				gNail.rotacionaRoll(-NAIL_ROT_INCREMENT);
				break;
		}
	};
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

function renderizaCena() {
	gTempoAtual = Date.now();
	let delta = gTempoAtual - gTempoAnterior;

	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	if (!gPaused) {
		gNail.moveForward();

		for (let balao of gBaloes) {
			balao.atualiza(delta);
		}
	}

	for (let balao of gBaloes) {
		balao.renderiza();
	}

	gTempoAnterior = gTempoAtual;

	window.requestAnimationFrame(renderizaCena);
}

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
