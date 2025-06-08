attribute vec3 aPosition;
attribute vec3 aColor;
varying vec3 vColor;
uniform mat4 uTransform;
void main() {
    // Versão simplificada sem matriz de projeção
    gl_Position = uTransform * vec4(aPosition, 1.0);
    vColor = aColor;
}