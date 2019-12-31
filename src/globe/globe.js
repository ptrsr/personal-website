import { 
    RawShaderMaterial,
    PlaneGeometry,
    Mesh,
    Matrix4,
    Vector3,
    Vector2,
    Sphere,
    Raycaster
} from "three";

import sphereVertShader from './shaders/sphere.vs'
import globeFragShader from './shaders/globe.fs'


export default class Globe extends Mesh {
    constructor(settings, textures) {
        // globe is rendered in screen space on a plane using raycasting in the fragment shader
        const geometry = new PlaneGeometry(2, 2);

        // globe shader
        const material = new RawShaderMaterial({
            uniforms: {
                sunLightDir: { value: new Vector3() },
                invViewMatrix: { value: new Matrix4() },
                scale: { value: settings.scale },
                
                a_scale: { value: settings.atmosphere.scale },
                a_color: { value: settings.atmosphere.color },
                a_brightness: { value: settings.atmosphere.brightness },
                a_reflection: { value: settings.atmosphere.reflection },
                a_ray: { value: settings.atmosphere.ray },
                a_mie: { value: settings.atmosphere.mie },
                a_spread: { value: settings.atmosphere.spread },
                a_thick: { value: settings.atmosphere.thick },
                a_test: { value: settings.atmosphere.test },

                t_day: { type: 't', value: textures.day },
                t_aux: { type: 't', value: textures.aux },
            },
            vertexShader: sphereVertShader,
            fragmentShader: globeFragShader,
            transparent: true
        });

        // mesh constructor
        super(geometry, material);
        
        // pass camera local transform to shader
        this.onBeforeRender = (renderer, scene, camera, geometry, material) => {
            material.uniforms.invViewMatrix.value = camera.matrixWorld;
        }
    }

    onClickDown = (state, event) => {
        this.start = new Date();
        if (event.type === "mousedown") {
            this.mouseStartPos = new Vector2(event.clientX, event.clientY);
        } else if (event.type === "touchstart") {
            this.mouseStartPos = new Vector2(event.touches[0].clientX, event.touches[0].clientY);
        }
    }

    onClickUp = (state, event) => {
        if (this.handled) {
            return;
        }

        const deltaDate = (new Date() - this.start) / 1000;
        if (deltaDate > 0.2) {
            return;
        }

        const mouseUpPos = new Vector2();
        if (event.type === "mouseup") {
            if (event.which != 1) {
                return;
            }
            mouseUpPos.x = event.clientX;
            mouseUpPos.y = event.clientY;
        } else if (event.type === "touchend") {
            mouseUpPos.x = event.changedTouches[0].clientX;
            mouseUpPos.y = event.changedTouches[0].clientY;
        } else {
            throw "Unsupported click event.";    
        }

        this.handled = true;
        
        setTimeout(() => {
            this.handled = false;
        }, 500);


        const mouseMovedDist = this.mouseStartPos.clone().sub(mouseUpPos).length();
        if (mouseMovedDist > 10) {
            return;
        }

        const rect = event.target.getBoundingClientRect();
        mouseUpPos.x -= rect.left;
        mouseUpPos.y -= rect.top;

        mouseUpPos.multiplyScalar(window.devicePixelRatio)
        
        mouseUpPos.x =  (mouseUpPos.x / state.canvas.width) * 2 - 1;
        mouseUpPos.y = -(mouseUpPos.y / state.canvas.height) * 2 + 1;
        
        const caster = new Raycaster();
        caster.setFromCamera(mouseUpPos, state.objects.camera);
        
        const globe = state.objects.globe;
        const sphere = new Sphere(globe.position, globe.material.uniforms.scale.value);

        const hit = caster.ray.intersectsSphere(sphere);
        
        if (hit) {
            state.canvas.fullscreen.toggle();
        }
    }

    setSunDir = (dir) => {
        this.material.uniforms.sunLightDir.value = dir;
    }

    
}
