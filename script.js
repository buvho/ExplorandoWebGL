const canvas = document.getElementById("glCanvas");
const gl = canvas.getContext("webgl"); // pega o webgl

 const vertices = new Float32Array([
    0.5, 0.5, 0.5,
    0.5, 0.5, -0.5,
    0.5, -0.5, 0.5,
    0.5, -0.5, -0.5,

    -0.5, 0.5, 0.5,
    -0.5, 0.5, -0.5,
    -0.5, -0.5, 0.5,
    -0.5, -0.5, -0.5,

]);
const colors = new Float32Array([
    // Cores para o primeiro triângulo (vermelho)
    0.0, 0.0, 0.0,
    0.0, 0.0, 1.0,
    0.0, 1.0, 0.0,
    0.0, 1.0, 1.0,

    // Cores para o segundo triângulo (verde)
    1.0, 0.0, 0.0,
    1.0, 0.0, 1.0,
    1.0, 1.0, 0.0,
    1.0, 1.0, 1.0,
]);

const indices = new Uint16Array([
  // 1
  0, 1, 2, 1,2,3,
  
  //2
  0,2,4, 6,4,2,
  
  //3
  5,0,4, 1,5,0,

  //4
  3,1,7, 7,1,5,
  
  //4
  7,4,5, 7,4,6,

  //5
 7,2,6, 7,2,3

]);


if (!gl) { // verifica compatibilidade
    alert("Seu navegador não suporta WebGL!");
    throw new Error("WebGL não suportado");
}

function resize() { // redimensiona o canva para o tamanho da tela
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height); //nao sei oq faz, acretito eu que sete onde o webgl vai atuar

    gl.clearColor(0.0, 0.0, 0.0, 1.0) // seta a cor de limpesa do canva pra preto
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); //??????
}
window.addEventListener("resize", resize); //reaplica o resize sempre que o tamanho da tela mudar
resize(); 

async function loadShader(url) {
    const response = await fetch(url);
    return await response.text();
}

function createShader(gl, source, type) { //cria os shaders
    const shader = gl.createShader(type);  
    gl.shaderSource(shader, source);  // pega o arquivo do shader
    gl.compileShader(shader); //compila o shader

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) { //ve se conseguiu criar o shader 
        console.error("Erro no shader:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

async function loadShaders() {
    const vertSource = await loadShader("shaders/vertex.glsl") //pega um elemento vertexShader (acredito que nao funcione, pos ele é um arquivo separado)
    const fragSource = await loadShader("shaders/fragment.glsl")

    const vertexShader = createShader(gl, vertSource, gl.VERTEX_SHADER); // cria ambos os shaders
    const fragmentShader = createShader(gl, fragSource, gl.FRAGMENT_SHADER);

    const program = gl.createProgram(); 
    gl.attachShader(program, vertexShader); //conecta os arquivos de shader ao WebGl
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program); //????

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) { //detectar se deu algum problema
        console.error("Erro no programa:", gl.getProgramInfoLog(program));
        return null;
    }

    return program;
}


let glProgram;

async function init() {
    glProgram = await loadShaders();
    
    if (!glProgram) {
        console.error("Falha ao criar o programa de shaders");
        return;
    }

    gl.useProgram(glProgram);

    setupBuffers();

    requestAnimationFrame(render);
}

function setupBuffers() {

    // Criação do buffer
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const aPosition = gl.getAttribLocation(glProgram, "aPosition");
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(
        aPosition,
        3,          // 3 componentes (x, y, z)
        gl.FLOAT,   // Tipo dos dados
        false,      // Normalizar?
        0,          // Stride
        0           // Offset
    );

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,colors,gl.STATIC_DRAW);
    const aColor = gl.getAttribLocation(glProgram, "aColor");
    gl.enableVertexAttribArray(aColor);
    gl.vertexAttribPointer(
        aColor,
        3,
        gl.FLOAT,
        false,
        0,
        0
    )

    // Element Buffer (índices)
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);


}

function render(time) {
    // Limpa a tela
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    // Atualiza uniformes (se necessário)
    const uTimeLocation = gl.getUniformLocation(glProgram, "uTime");
    if (uTimeLocation) {
        gl.uniform1f(uTimeLocation, time * 0.001);
    }
    girar(time);
    // Desenha o triângulo
    gl.drawElements(
        gl.TRIANGLES,       // Modo
        indices.length,     // Quantidade de índices
        gl.UNSIGNED_SHORT,  // Tipo dos índices
        0                   // Offset
    );
    
    // Próximo frame
    requestAnimationFrame(render);
}

gl.enable(gl.DEPTH_TEST);

function girar(time){ 
    let angleX = time * 0.001
    let angleY = time * 0.001
    let angleZ = 1

    const cx = Math.cos(angleX);
    const sx = Math.sin(angleX);
    const cy = Math.cos(angleY);
    const sy = Math.sin(angleY);
    const cz = Math.cos(angleZ);
    const sz = Math.sin(angleZ);

    // Matriz combinada (Z * Y * X)
    const rotationMatrix = new Float32Array([
        cy * cz, sx * sy * cz + cx * sz, -cx * sy * cz + sx * sz, 0,
        -cy * sz, -sx * sy * sz + cx * cz, cx * sy * sz + sx * cz, 0,
        sy, -sx * cy, cx * cy, 0,
        0, 0, 0, 1
    ]);

    const uTransform = gl.getUniformLocation(glProgram, "uTransform");
    gl.uniformMatrix4fv(uTransform,false,rotationMatrix);
}

// 6. Inicia tudo
init();