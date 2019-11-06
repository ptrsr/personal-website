precision highp float;

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

attribute vec3 position;

varying vec2 uv;


void main() {
    uv = position.xy;

    mat4 modelViewMatrix = viewMatrix * modelMatrix;

    // first column
    modelViewMatrix[0][0] = modelMatrix[0][0]; 
    modelViewMatrix[0][1] = 0.0; 
    modelViewMatrix[0][2] = 0.0; 

    // second column
    modelViewMatrix[1][0] = 0.0; 
    modelViewMatrix[1][1] = modelMatrix[1][1]; 
    modelViewMatrix[1][2] = 0.0; 

    // third column
    modelViewMatrix[2][0] = 0.0; 
    modelViewMatrix[2][1] = 0.0; 
    modelViewMatrix[2][2] = modelMatrix[2][2]; 

    // position of render plane vertex relative to camera
    vec4 viewPos = modelViewMatrix * vec4(position, 1);

    gl_Position =  projectionMatrix * modelViewMatrix * vec4(position, 1);
}
