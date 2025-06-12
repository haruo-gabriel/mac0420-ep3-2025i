/*
    Esse arquivo contém algumas constantes que usei
    na preparação do demo do EP3.
*/

// Funções auxiliares
function randomRange(min, max) {
	return Math.random() * (max - min) + min;
}

let canvas, gl, program;
let viewMatrix, perspectiveMatrix;
let uModel, uView, uPerspective;
let uInverseTransposeModel;
let uLightPos;
let uAmbientColor, uDiffuseColor, uSpecularColor, uShininess;
var DEBUG = false;

// BOLHAS
// const BOLHA_NUMERO = 20; // Numero de bolhas na cena
// const BOLHA_PHONG_ALFA_MIN = 50;
// const BOLHA_PHONG_ALFA_MAX = 500;
// const BOLHA_MIN_VEL = 1; // translacao em e rotacao por eixo
// const BOLHA_MAX_VEL = 5;
// const BOLHA_MIN_POS = -100; // posicao em cada eixo
// const BOLHA_MAX_POS = 100;
// const BOLHA_MIN_RAIO = 10;
// const BOLHA_MAX_RAIO = 30;
// const BOLHA_MIN_RESOLUCAO = 0; // balão
// const BOLHA_MAX_RESOLUCAO = 4; // esfera

// BOLHAS (constantesde TESTE)
const BOLHA_NUMERO = 20; // Numero de bolhas na cena
const BOLHA_PHONG_ALFA_MIN = 50;
const BOLHA_PHONG_ALFA_MAX = 500;
const BOLHA_MIN_VEL = 0.001; // translacao em e rotacao por eixo
const BOLHA_MAX_VEL = 0.003;
const BOLHA_MIN_POS = -1.0; // posicao em cada eixo
const BOLHA_MAX_POS = 1.0;
const BOLHA_MIN_RAIO = 0.01;
const BOLHA_MAX_RAIO = 0.1;
const BOLHA_MIN_RESOLUCAO = 0; // balão
const BOLHA_MAX_RESOLUCAO = 4; // esfera

// Cor de fundo
const COR_CLEAR = [0.2, 0.2, 0.6, 1.0];

// Propriedades da fonte de luz
const LUZ = {
	position: vec4(50.0, 50.0, 150.0, 1.0),
	ambientColor: vec4(0.47, 0.47, 0.47, 1.0),
	diffuseColor: vec4(0.68, 0.68, 0.68, 1.0),
	specularColor: vec4(0.39, 0.39, 0.39, 1.0),
};

// const AGULHA_INIT = {
// 	pos: vec3(150, 150, 150),
// 	at: vec3(0, 0, 0),
// 	up: vec3(0, 1, 0),
// 	fovy: 45.0,
// 	aspect: 1.0,
// 	near: 1,
// 	far: 2000,
// 	vtrans: 1,
// 	theta: vec3(45, -45, 0),
// };