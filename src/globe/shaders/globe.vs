precision highp float;

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 invViewMatrix;

uniform vec3 cameraPosition;

uniform float scale;

attribute vec3 vertexPos;
varying vec3 fragPos;

// sPos : position of sphere in 2D, where the Y should be perpendicular to camera plane
// s    : sign for either min or max of sphere on X axis of sPos
// returns additional correction on X axis due to projection
float perspectiveCorrect(vec2 sPos, float s) {
    float l = sqrt(pow(sPos.y, 2.0) + pow(sPos.x, 2.0));
    float a = asin(sPos.x / l);
    float b = asin(scale / l) * s;
    return ((scale / cos(a + b)) - scale) * s;
}

void main() {
    /* 
       first we multiply the matrices together for positioning
       then set rotation part to identity for a billboard effect
       (where the render plane is always parallel with the near plane)
    */
    mat4 modelViewMatrix = viewMatrix * modelMatrix;

    // first column
    modelViewMatrix[0][0] = scale; 
    modelViewMatrix[0][1] = 0.0; 
    modelViewMatrix[0][2] = 0.0; 

    // second column
    modelViewMatrix[1][0] = 0.0; 
    modelViewMatrix[1][1] = scale; 
    modelViewMatrix[1][2] = 0.0; 

    // third column
    modelViewMatrix[2][0] = 0.0; 
    modelViewMatrix[2][1] = 0.0; 
    modelViewMatrix[2][2] = scale; 

    // position of render plane vertex relative to camera
    vec4 viewPos = modelViewMatrix * vec4(vertexPos, 1);

    // position of sphere center relative to camera
    vec4 spherePos = viewMatrix * modelMatrix[3];

    // extend plane sides for complete render of sphere
    viewPos.x += perspectiveCorrect(spherePos.xz, vertexPos.x);
    viewPos.y += perspectiveCorrect(spherePos.yz, vertexPos.y);

    // forward world pos of vertex to fragment shader
    fragPos = (invViewMatrix * viewPos).xyz;

    // corner positions of plane
    gl_Position = projectionMatrix * viewPos;
}
