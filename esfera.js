class Esfera {

    constructor(ndivisoes=0) {
        const esfera_cantos = [
            //positivos
            vec3(1.0, 0.0, 0.0),
            vec3(0.0, 1.0, 0.0),
            vec3(0.0, 0.0, 1.0),
            // negativos
            vec3(-1.0, 0.0, 0.0),
            vec3(0.0, -1.0, 0.0),
            vec3(0.0, 0.0, -1.0),
        ]
        

        const triangulo = [
            [esfera_cantos[0], esfera_cantos[1], esfera_cantos[2]],
            [esfera_cantos[0], esfera_cantos[1], esfera_cantos[5]],
            [esfera_cantos[0], esfera_cantos[4], esfera_cantos[2]],
            [esfera_cantos[0], esfera_cantos[4], esfera_cantos[5]],
            [esfera_cantos[3], esfera_cantos[1], esfera_cantos[2]],
            [esfera_cantos[3], esfera_cantos[1], esfera_cantos[5]],
            [esfera_cantos[3], esfera_cantos[4], esfera_cantos[2]],
            [esfera_cantos[3], esfera_cantos[4], esfera_cantos[5]],
        ]

        console.log(triangulo)

        this.pos = [];
        this.nor = [];
        this.axis = 0;
        this.theta = vec3(0.0, 0.0, 0.0);
        this.paused = false;
        
        for (let i = 0; i < triangulo.length; i++) {
            let a, b, c;
            [a, b, c] = triangulo[i];
            this.dividaTriangulo(a, b, c, ndivisoes);
          }
    }

    dividaTriangulo(a, b, c, ndivs) {
        // Cada nível quebra um triângulo em 4 subtriângulos
        // a, b, c em ordem mão direita
        //    c
        // a  b 
      
        // caso base
        if (ndivs > 0) {
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
        }
      
        else {
          this.insiraTriangulo(a, b, c);
        }
      };
      
      insiraTriangulo(a, b, c) {
        this.pos.push(a);
        this.pos.push(b);
        this.pos.push(c);

        // Get the normal of the face
        const v1 = subtract(b, a);
        const v2 = subtract(c, a);
        const normal = vec3(cross(v1, v2));

        this.nor.push(
            normal, normal, normal,
        );
      }
}

const FOVY = 60.0;
const ASPECT = 1.0;
const NEAR = 0.1;
const FAR = 50.0;

const EYE = vec3(2.0, 2.0, 0.0);
const AT = vec3(0.0, 0.0, 0.0);
const UP = vec3(0.0, 1.0, 0.0);

const LIGHT = {
    position: vec4(0.0, 1.0, 0.0, 1.0),
    ambientColor: vec4(0.1, 0.1, 0.1, 1.0),
    diffuseColor: vec4(1.0, 1.0, 1.0, 1.0),
    specularColor: vec4(1.0, 1.0, 1.0, 1.0)
};

const MATERIAL = {
    ambientColor: vec4(0.8, 0.8, 0.8, 1.0),
    diffuseColor: vec4(1.0, 0.5, 1.0, 1.0),
    shininess: 50.0
};
