precision highp float;

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

attribute vec3 position;

void main() {
    gl_Position = projectionMatrix * viewMatrix * vec4(position, 1);
}
