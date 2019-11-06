precision highp float;

uniform vec3 cameraPosition;
varying vec2 uv;
uniform float scale;


void main() {
        // gl_FragColor = vec4(1);

        float fade1 = 1. - distance(uv, vec2(0)) * 20.;
        float fade2 = 1. - distance(uv, vec2(0)) * 1.5;

        fade1 = max(0.0, min(1.0, fade1));
        fade1 *= 2.5;
        fade1 = pow(fade1, 3.0);

        fade2 = max(0.0, min(1.0, fade2));
        fade2 *= 0.4;
        fade2 = pow(fade2, 2.5);

        // float test = fade1;

        float alpha = fade1 + fade2;
        vec3 color = mix(vec3(1, .6, .3), vec3(1), fade2 * 4.0 + fade1 * .7);

        // color *= fade1 * 1.;

        // color = min(vec3(1), color);

        gl_FragColor = vec4(color, alpha);
}
