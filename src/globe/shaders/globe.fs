precision highp float;

// for neighbour fragment checking in globeTexture function
#extension GL_OES_standard_derivatives : enable

#define PI 3.14159265359
#define MAX 10000
#define ATMOS_MULTI 0.1
#define SCALE_MULTI 6.0

uniform mat4 modelMatrix;
uniform mat4 invViewMatrix;

uniform vec3 sunLightDir;
uniform vec3 cameraPosition;

uniform float scale;

// atmosphere control variables
uniform vec3 a_color;
uniform float a_brightness;
uniform float a_reflection;
uniform float a_ray;
uniform float a_mie;
uniform float a_spread;
uniform float a_thick;
uniform float a_test;

// globe textures
uniform sampler2D t_day;
uniform sampler2D t_aux;

// position of quad fragment
varying vec3 fragPos;


// functions
vec2 sphere(vec3 origin, vec3 ray, float radius);
vec3 globeTexture(vec3 normal, vec3 ray, vec3 lightDir);
vec3 atmosphere(vec3 o, vec3 dir, vec2 e, vec3 l, vec2 diameters);


void main() {
    // diameter of globe
    float d_inner = scale * .99;
    //diameter of atmosphere
    float d_outer = scale;

    // out of screen ray
    vec3 ray = normalize(cameraPosition - fragPos);

    // atmosphere raycast
    vec2 a_hit = sphere(cameraPosition, ray, d_outer);
    if (a_hit.x > a_hit.y) {
        // not even the atmosphere is hit, return transparent fragment
        gl_FragColor = vec4(0);
        return;
    }

    // final fragment color
    vec3 color;

    // globe raycast
    vec2 g_hit = sphere(cameraPosition, ray, d_inner);
    if (g_hit.x < g_hit.y) {
        // calculate world normal
        vec3 worldPos = (ray * g_hit.x);
        vec3 normalDir = normalize(cameraPosition - worldPos);

        // set color to globe texture
        color = globeTexture(normalDir, ray, sunLightDir);
    }

    /* distances of ray vs sphere hits.
       hits.x = a_hit.x , as the atmosphere is always hit first. 
       hits.y is either the ray hitting the globe or the ray exiting the atmosphere. */
    vec2 hits = vec2(a_hit.x, min(g_hit.x, a_hit.y));

    // add atmosphere
    color += atmosphere(cameraPosition, ray, -hits, sunLightDir, vec2(d_inner, d_outer));

    // TODO: clean up the transparent atmosphere in a function
    // calculate world normal
    vec3 worldPos = (ray * hits.x);
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
vec2 sphere(vec3 origin, vec3 ray, float radius) {
	float b = dot(origin, ray);
	float c = dot(origin, origin) - radius * radius;
	
	float d = b * b - c;
	if (d < 0.0) {
		return vec2(MAX, -MAX);
	}
	d = sqrt(d);
	return vec2(b - d, b + d);
}

vec2 uvMap(vec3 normalDir) {
    // https://forum.unity.com/threads/what-is-this-mipmap-artifact.657052/
    float t = atan(normalDir.x, normalDir.z) / (2.0 * PI);

    float t_a = t + 0.5;
    float t_b = fract(t + 1.0) - 0.5;
    
    return vec2(
        fwidth(t_a) < fwidth(t_b) ? t_a : t_b,
        0.5 - asin(-normalDir.y) / PI
    );
}

vec3 globeTexture(vec3 normalDir, vec3 ray, vec3 lightDir) {
    vec2 uv = uvMap(normalDir);

    // texture mapping
    vec3 c_day = texture2D(t_day, uv).rgb;
    vec3 c_aux = texture2D(t_aux, uv).rgb;
    
    // city lights
    float lights = c_aux.r;
    // water specularity
    float specular = c_aux.g;
    // cloud density
    float cloud = c_aux.b;

    // ideal reflection dir for water
    vec3 reflectDir = reflect(-lightDir, normalDir);

    // TODO: optimize this bit
    float reflectAmount = pow(max(dot(ray, reflectDir), 0.0), 15.0) * specular;

    // add clouds
    c_day = mix(c_day, vec3(1), vec3(cloud * 1.1));

    // lighting of earth
    float shadow = max(0.01, dot(normalDir, lightDir));
    c_day *= shadow;

    c_day += lights * pow((1.0 - max(0., dot(lightDir, normalDir) + 0.2)), 5.0);

    c_day = mix(c_day, vec3(1), reflectAmount / 2.0);

    return c_day;
}

// Mie
// g : ( -0.75, -0.999 )
//      3 * ( 1 - g^2 )               1 + c^2
// F = ----------------- * -------------------------------
//      8PI * ( 2 + g^2 )     ( 1 + g^2 - 2 * g * c )^(3/2)
float calcMiePhase(float g, float c, float cc) {
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
float calcRayPhase(float cc) {
	return (3.0 / 16.0 / PI) * (1.0 + cc);
}

float calcDensity(vec3 p, float d) {
	return exp(max(length(p) - d, 0.0));
}

float calcOptic(vec3 v, vec3 u, float d) {
	vec3 s = (u - v);
	vec3 x = v + s;
	return calcDensity(x, d) * length(s);
}

vec3 atmosphere(vec3 o, vec3 dir, vec2 e, vec3 l, vec2 diameters) {
	// distance traveled in atmosphere
    float dist = (e.y - e.x) / (scale * SCALE_MULTI);
    // traveled direction vector
    vec3 s = -dir * dist;
    // middle of traveled atmosphere vector in world space
	vec3 v = -o + -dir * (e.x + dist * 0.5);

    // atmosphere density
    float density = calcDensity(v, diameters.x) * dist;

    float reflection = pow(density * a_ray, a_thick);
    float refraction = pow(density * a_mie, a_test);
    
    // amount of distance the light traveled in the atmosphere
    vec2 f = sphere(v, l, diameters.y) * (a_spread / scale);
    // position where the light enters the atmosphere
    vec3 u = v - l * f.y;
    
    float optic = calcOptic(v, u, diameters.x);
    
    // globe lighting
    float gLit = dot(dir, -l);

    // slow fadeout on side
    float fade = 0.7 + gLit * .8;

    // atmosphere direct lighting
    vec3 pos = normalize(o + dir * e.x);
    float aLit = dot(l, pos) * 1.5;

    // darken atmosphere on sides
    reflection *= min(1., max(0., fade + aLit));

    // atmosphere color
    vec3 color = a_color * ATMOS_MULTI;

    // red color grading
    vec3 grading = exp(-optic * color - (refraction + optic));
    
    // brightness adjustment
	float gg = gLit * gLit;
    vec3 ray = reflection * grading * color * calcRayPhase(gg);
    vec3 mie = refraction * grading * calcMiePhase(a_reflection, gLit, gg);

	return a_brightness * (ray + mie);
}
