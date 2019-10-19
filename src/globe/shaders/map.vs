precision highp float;

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

attribute vec3 position;

#define DEG2RAD 0.0174533
#define PI 3.14159265359

void main() {
    gl_Position = projectionMatrix * viewMatrix * vec4(position, 1);
}
