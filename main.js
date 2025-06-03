"use strict";

// Globals
let canvas;
let gl;
let esfera;
let program;
let viewMatrix;
let perspectiveMatrix;
let uModel;
let uView;
let uPerspective;
let uInverseTransposeModel;
let uLightPos;
let uAmbientColor;
let uDiffuseColor;
let uSpecularColor;
let uShininess;
let camera = {
    raio: 3,
    theta: 0,
    pho: 0,
    step: Math.PI / 18
};
// Globals

window.onload = main;

function main() {
    canvas = document.querySelector("#glcanvas");
    gl = canvas.getContext("webgl2");

    if (!gl) {
        console.error("WebGL2 not supported, using WebGL");
        return;
    }

    esfera = new Esfera();

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    createInterface();
    createShaders();
    renderScene();
}

function createInterface() {
    document.getElementById("bRun").onclick = () => {
    }

    document.getElementById("bStep").onclick = () => {
    }
}

function createShaders() {
    program = makeProgram(gl, vertexShaderSource, fragmentShaderSource);

    gl.useProgram(program);

    // Normal buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, flatten(esfera.nor), gl.STATIC_DRAW);

    const norLoc = gl.getAttribLocation(program, "aNormal");
    gl.vertexAttribPointer(norLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(norLoc);

    // Position buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, flatten(esfera.pos), gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(posLoc);

    // Uniform locations
    uModel = gl.getUniformLocation(program, "uModel");
    uView = gl.getUniformLocation(program, "uView");
    uPerspective = gl.getUniformLocation(program, "uPerspective");
    uInverseTransposeModel = gl.getUniformLocation(program, "uInverseTransposeModel");

    // Perspective matrix
    perspectiveMatrix = perspective(FOVY, ASPECT, NEAR, FAR);
    gl.uniformMatrix4fv(uPerspective, false, flatten(perspectiveMatrix));

    // Lighting parameters
    uLightPos = gl.getUniformLocation(program, "uLightPos");
    uAmbientColor = gl.getUniformLocation(program, "uAmbientColor");
    uDiffuseColor = gl.getUniformLocation(program, "uDiffuseColor");
    uSpecularColor = gl.getUniformLocation(program, "uSpecularColor");
    uShininess = gl.getUniformLocation(program, "uShininess");

    gl.uniform4fv(uLightPos, LIGHT.position);
    gl.uniform4fv(uAmbientColor, mult(LIGHT.ambientColor, MATERIAL.ambientColor));
    gl.uniform4fv(uDiffuseColor, mult(LIGHT.diffuseColor, MATERIAL.diffuseColor));
    gl.uniform4fv(uSpecularColor, LIGHT.specularColor);
    gl.uniform1f(uShininess, MATERIAL.shininess);
}

function renderScene() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if (!esfera.paused) {
        esfera.theta[esfera.axis] += 1.0;
    }

    const rx = rotateX(esfera.theta[0]);
    const ry = rotateY(esfera.theta[1]);
    const rz = rotateZ(esfera.theta[2]);

    const model = mult(rz, mult(ry, rx));

    // View matrix
    const r = camera.raio;
    const theta = camera.theta;
    const pho = camera.pho;
    const eye = vec3(
        r * Math.sin(theta) * Math.cos(pho),
        r * Math.sin(pho),
        r * Math.cos(theta) * Math.cos(pho)
    );
    viewMatrix = lookAt(eye, AT, UP);
    gl.uniformMatrix4fv(uView, false, flatten(viewMatrix));

    const modelView = mult(viewMatrix, model);
    const inverseTransposeModel = transpose(inverse(modelView));

    gl.uniformMatrix4fv(uModel, false, flatten(model));
    gl.uniformMatrix4fv(uInverseTransposeModel, false, flatten(inverseTransposeModel));

    gl.drawArrays(gl.TRIANGLES, 0, esfera.pos.length);

    window.requestAnimationFrame(renderScene);
}

window.onkeydown = function (event) {
    switch (event.key) {
        case "ArrowUp":
            camera.pho = Math.min(camera.pho + camera.step, Math.PI / 2);
            break;
        case "ArrowDown":
            camera.pho = Math.max(camera.pho - camera.step, -Math.PI / 2);
            break;
        case "ArrowLeft":
            camera.theta = Math.max(camera.theta - camera.step, -Math.PI);
            break;
        case "ArrowRight":
            camera.theta = Math.min(camera.theta + camera.step, Math.PI);
            break;
    }
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
`

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
`