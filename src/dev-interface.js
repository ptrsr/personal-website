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

        gui.add({ Save : saveToClipboard.bind(null, settings) }, 'Save');

        // camera
        const camera_folder = gui.addFolder("Camera");

        // fov
        const fov = camera_folder.add(settings.camera, 'fov');
        fov.onChange(function(value) {
            this.setFocalLength(value);
            settings.camera.fov = value;
        }.bind(state.camera));


        const globe_folder = gui.addFolder("Globe");

        exposeUniform(
            globe_folder, 'add', 'scale',
            settings.globe, 
            state.objects.globe.material.uniforms.scale
        );

        const atmos_folder = globe_folder.addFolder("Atmosphere");


        exposeUniform(
            atmos_folder, 'addColor', 'color',
            settings.globe.atmosphere, 
            state.objects.globe.material.uniforms.a_color
        );

        exposeUniform(
            atmos_folder, 'add', 'brightness',
            settings.globe.atmosphere, 
            state.objects.globe.material.uniforms.a_brightness
        );

        exposeUniform(
            atmos_folder, 'add', 'reflection',
            settings.globe.atmosphere,
            state.objects.globe.material.uniforms.a_reflection
        );

        exposeUniform(
            atmos_folder, 'add', 'ray',
            settings.globe.atmosphere,
            state.objects.globe.material.uniforms.a_ray
        );

        exposeUniform(
            atmos_folder, 'add', 'mie',
            settings.globe.atmosphere,
            state.objects.globe.material.uniforms.a_mie
        );

        exposeUniform(
            atmos_folder, 'add', 'spread',
            settings.globe.atmosphere,
            state.objects.globe.material.uniforms.a_spread
        );

        exposeUniform(
            atmos_folder, 'add', 'thick',
            settings.globe.atmosphere,
            state.objects.globe.material.uniforms.a_thick
        );

        exposeUniform(
            atmos_folder, 'add', 'test',
            settings.globe.atmosphere,
            state.objects.globe.material.uniforms.a_test
        );
    }
}
