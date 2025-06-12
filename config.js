/*
    Esse arquivo contém algumas constantes que usei
    na preparação do demo do EP3.
*/

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
const BOLHA_MAX_VEL = 0.002;
const BOLHA_MIN_POS = -1.0; // posicao em cada eixo
const BOLHA_MAX_POS = 1.0;
const BOLHA_MIN_RAIO = 0.05;
const BOLHA_MAX_RAIO = 0.2;
const BOLHA_MIN_RESOLUCAO = 0; // balão
const BOLHA_MAX_RESOLUCAO = 4; // esfera

// NAIL
const NAIL_MAX_VEL = 1;
const NAIL_MIN_VEL = -1;
const NAIL_VEL_INCREMENT = 0.001;
const NAIL_ROT_INCREMENT = Math.PI / 90; // 10 degrees
// Cor de fundo
const COR_CLEAR = [0.2, 0.2, 0.6, 1.0];

// Propriedades da fonte de luz
const LUZ = {
	position: vec4(50.0, 50.0, 150.0, 1.0),
	ambientColor: vec4(0.47, 0.47, 0.47, 1.0),
	diffuseColor: vec4(0.68, 0.68, 0.68, 1.0),
	specularColor: vec4(0.39, 0.39, 0.39, 1.0),
};



// Funções auxiliares
function randomRange(min, max) {
	return Math.random() * (max - min) + min;
}