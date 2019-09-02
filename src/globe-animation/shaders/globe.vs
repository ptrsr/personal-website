precision mediump float;

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

uniform mat4 invViewMatrix;

attribute vec3 vertexPos;
varying vec3 worldPos;

void main() {
    mat4 modelViewMatrix = viewMatrix * modelMatrix;
    // First colunm.
    modelViewMatrix[0][0] = 1.0; 
    modelViewMatrix[0][1] = 0.0; 
    modelViewMatrix[0][2] = 0.0; 

    // Second colunm.
    modelViewMatrix[1][0] = 0.0; 
    modelViewMatrix[1][1] = 1.0; 
    modelViewMatrix[1][2] = 0.0; 

    // Thrid colunm.
    modelViewMatrix[2][0] = 0.0; 
    modelViewMatrix[2][1] = 0.0; 
    modelViewMatrix[2][2] = 1.0; 


    vec4 viewPos = modelViewMatrix * vec4(vertexPos, 1);
    worldPos = (invViewMatrix * viewPos).xyz;

    gl_Position = projectionMatrix * viewPos;
}
