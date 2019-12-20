import dat from 'dat.gui';
import { Vector3 } from 'three';

function saveToClipboard(settings) {
    navigator.clipboard.writeText(JSON.stringify(settings, null, 1));
}

function exposeUniform(parent, func, name, settings, parameter) {
    const field = parent[func](settings, name);
    field.onChange(function(value) {
        this.value = value;
        settings[name] = value;
    }.bind(parameter));
}


export default class DevInterface {
    constructor(settings, state) {
        const gui = new dat.GUI({ load: settings });
        gui.toggleHide();

        gui.add({ Save : saveToClipboard.bind(null, settings) }, 'Save');

        const globeFolder = gui.addFolder("Globe");

        exposeUniform(
            globeFolder, 'add', 'scale',
            settings.globe, 
            state.objects.globe.material.uniforms.scale
        );
        
        this.exposeCamera(gui, settings, state);
        this.exposeAtmosphere(globeFolder, settings, state);
    }

    exposeCamera(parent, settings, state) {
        const cameraFolder = parent.addFolder("Camera");

        const zoom = cameraFolder.add(settings.camera, 'zoom');
        zoom.onChange(function(value) {
            this.zoom = value;
            settings.camera.zoom = value;
            window.dispatchEvent(new Event('resize'));
        }.bind(state.objects.camera));
    }

    exposeAtmosphere(parent, settings, state) {
        const atmosFolder = parent.addFolder("Atmosphere");

        exposeUniform(
            atmosFolder, 'addColor', 'color',
            settings.globe.atmosphere, 
            state.objects.globe.material.uniforms.a_color
        );

        exposeUniform(
            atmosFolder, 'add', 'brightness',
            settings.globe.atmosphere, 
            state.objects.globe.material.uniforms.a_brightness
        );

        exposeUniform(
            atmosFolder, 'add', 'reflection',
            settings.globe.atmosphere,
            state.objects.globe.material.uniforms.a_reflection
        );

        exposeUniform(
            atmosFolder, 'add', 'ray',
            settings.globe.atmosphere,
            state.objects.globe.material.uniforms.a_ray
        );

        exposeUniform(
            atmosFolder, 'add', 'mie',
            settings.globe.atmosphere,
            state.objects.globe.material.uniforms.a_mie
        );

        exposeUniform(
            atmosFolder, 'add', 'spread',
            settings.globe.atmosphere,
            state.objects.globe.material.uniforms.a_spread
        );

        exposeUniform(
            atmosFolder, 'add', 'thick',
            settings.globe.atmosphere,
            state.objects.globe.material.uniforms.a_thick
        );

        exposeUniform(
            atmosFolder, 'add', 'test',
            settings.globe.atmosphere,
            state.objects.globe.material.uniforms.a_test
        );
    }
}
