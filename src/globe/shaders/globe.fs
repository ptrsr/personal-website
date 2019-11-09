precision highp float;
#extension GL_OES_standard_derivatives : enable

#define PI 3.14159265359

uniform mat4 invViewMatrix;
uniform mat4 modelMatrix;

uniform vec3 cameraPosition;
uniform vec3 lDir;

uniform float scale;

uniform vec3 a_color;
uniform float a_brightness;
uniform float a_reflection;
uniform float a_ray;
uniform float a_mie;
uniform float a_spread;
uniform float a_thick;
uniform float a_test;

uniform sampler2D dayTex;
uniform sampler2D nrmTex;
uniform sampler2D auxTex;

varying vec3 fragPos;


vec2 Sphere(vec3 origin, vec3 ray, float radius);
vec3 MapUV(vec3 normal, vec3 ray, vec3 lightDir);
vec3 in_scatter(vec3 o, vec3 dir, vec2 e, vec3 l, float inner, float outer);


void main() {
    float inner = scale * .99;
    float outer = scale;

    vec3 color = vec3(0);
    
    // out of screen ray
    vec3 ray = normalize(cameraPosition - fragPos);

    // atmosphere raycast
    vec2 outerSphereHits = Sphere(cameraPosition, ray, outer);
    if (outerSphereHits.x > outerSphereHits.y) {
        gl_FragColor = vec4(0);
        return;
    }

    // planet raycast
    vec2 innerSphereHits = Sphere(cameraPosition, ray, inner);
    if (innerSphereHits.x < innerSphereHits.y) {
        // calculate world normal
        vec3 worldPos = (ray * innerSphereHits.x);
        vec3 normalDir = normalize(cameraPosition - worldPos);

        // final earth texture
        color = MapUV(normalDir, ray, lDir);
    }

    outerSphereHits.y = min(outerSphereHits.y, innerSphereHits.x);

    vec3 I = in_scatter( cameraPosition, ray, -outerSphereHits.yx, lDir, inner, outer);
    color += pow(I, vec3(1));

    // calculate world normal
    vec3 worldPos = (ray * outerSphereHits.x);
    vec3 normalDir = normalize(cameraPosition - worldPos);

    // transparent atmosphere
    float t = min(1.0, 1.0 - dot(normalDir, ray) + 0.14);
    t = pow(t, 5.);
    t = 1. - t;
    t = min(1., t * 5.);

    gl_FragColor = vec4(color, t);
}

// ray intersects sphere
// e = -b +/- sqrt( b^2 - c )
#define MAX 10000
vec2 Sphere(vec3 origin, vec3 ray, float radius) {
	float b = dot(origin, ray);
	float c = dot(origin, origin) - radius * radius;
	
	float d = b * b - c;
	if (d < 0.0) {
		return vec2(MAX, -MAX);
	}
	d = sqrt(d);
	return vec2(b-d, b+d);
}


vec3 MapUV(vec3 normalDir, vec3 ray, vec3 lightDir) {
    // https://forum.unity.com/threads/what-is-this-mipmap-artifact.657052/
    float t = atan(normalDir.x, normalDir.z) / (2.0 * PI);

    float t_a = t + 0.5;
    float t_b = fract(t + 1.0) - 0.5;
    
    vec2 uv = vec2(
        fwidth(t_a) < fwidth(t_b) ? t_a : t_b,
        0.5 - asin(-normalDir.y) / PI
    );

    // texture mapping
    vec3 dayMap = texture2D(dayTex, uv).rgb;
    vec3 auxMap = texture2D(auxTex, uv).rgb;
    
    float lit = auxMap.r;
    float specular = auxMap.g;
    float cloud = auxMap.b;


    // reflection of water
    vec3 reflectDir = reflect(-lightDir, normalDir);

    // TODO: optimize this bit
    float reflectAmount = pow(max(dot(ray, reflectDir), 0.0), 15.0) * specular;


    // clouds
    dayMap = mix(dayMap, vec3(1), vec3(cloud * 1.1));

    // lighting of earth
    float shadow = max(0.01, dot(normalDir, lightDir));
    dayMap *= shadow;

    dayMap += lit * pow((1.0 - max(0., dot(lightDir, normalDir) + 0.2)), 5.0);

    dayMap = mix(dayMap, vec3(1), reflectAmount / 2.0);

    return dayMap;
}

// Mie
// g : ( -0.75, -0.999 )
//      3 * ( 1 - g^2 )               1 + c^2
// F = ----------------- * -------------------------------
//      8PI * ( 2 + g^2 )     ( 1 + g^2 - 2 * g * c )^(3/2)
float phase_mie(float g, float c, float cc) {
	float gg = g * g;
	
	float a = (1.0 - gg) * (1.0 + cc);

	float b = 1.0 + gg - 2.0 * g * c;
	b *= sqrt(b);
	b *= 2.0 + gg;	
	
	return (3.0 / 8.0 / PI) * a / b;
}

// Rayleigh
// g : 0
// F = 3/16PI * ( 1 + c^2 )
float phase_ray(float cc) {
	return (3.0 / 16.0 / PI) * (1.0 + cc);
}


float density(vec3 p, float d) {
	return exp(-max(length(p) - d, 0.0));
}

float optic(vec3 p, vec3 q, float d) {
	vec3 s = (q - p);
	vec3 v = p + s;
	return density(v, d) * length(s);
}

vec3 in_scatter(vec3 o, vec3 dir, vec2 e, vec3 l, float inner, float outer) {
    vec3 k_ray = a_color * .1;
    
	float len = (e.y - e.x) / (scale * 6.0);
    vec3 s = -dir * len;
	vec3 v = -o + -dir * (e.x + len * 0.5);
    
    vec2 f = Sphere(v, l, outer) * (a_spread / scale);

    float d_ray = pow(density(v, inner) * len * a_ray, a_thick);
    float d_mie = pow(density(v, inner) * len * a_mie, a_test);
    
    vec3 u = v - l * f.y;
    
    float n_ray1 = optic(v, u, inner);
    float n_mie1 = optic(v, u, inner);
    
    vec3 att = exp(-(d_ray + n_ray1) * k_ray - (d_mie + n_mie1));
    
	float c  = dot(dir, -l);
	float cc = c * c;

    vec3 ray = d_ray * att * k_ray * phase_ray(cc);
    vec3 mie = d_mie * att * phase_mie(a_reflection, c, cc);

    vec3 scatter = ray + mie;
	
	return a_brightness * scatter;
}
