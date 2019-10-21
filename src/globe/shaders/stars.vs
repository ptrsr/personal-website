precision highp float;

uniform mat4 viewMatrix;

attribute vec3 position;
varying vec3 fragPos;

void main() {
    fragPos = (viewMatrix * vec4(-position.x, position.y, 1, 0)).xyz;
    gl_Position = vec4(position.xy, 1, 1);
}
