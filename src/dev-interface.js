import dat from 'dat.gui';

function saveToClipboard(settings) {
    navigator.clipboard.writeText(JSON.stringify(settings, null, 1));
}

export default class DevInterface {
    constructor(settings, state) {
        const gui = new dat.GUI({ load: settings });

        gui.add(settings, 'test');
        gui.add(settings, 'toplel');

        gui.add({ Save : saveToClipboard.bind(null, settings) }, 'Save');

        // camera
        const folder = gui.addFolder("Camera");

        // fov
        const fov = folder.add(settings.camera, 'fov');
        fov.onChange(function(value) {
            this.setFocalLength(value);
            settings.camera.fov = value;
        }.bind(state.camera));


    }

}
