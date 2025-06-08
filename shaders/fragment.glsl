precision mediump float; //determina a presisão da coodernada nos vertices
varying vec3 vColor;


uniform vec2 uResolution; //detemina a resolução da tela
uniform float uTime; //determina o tempo para fazer animações

void main() {
    // vec2 uv = gl_FragCoord.xy / uResolution; //divide a tela para que o canto em superior esquerdo seja 0,0 e o inverso 1,1 idependente da resolução
    gl_FragColor = vec4(vColor, 1); // define as cores da renderização
}