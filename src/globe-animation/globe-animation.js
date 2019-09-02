import { Color, WebGLRenderer, Scene, PerspectiveCamera } from 'three'

export default class GlobeAnimation {
    constructor(canvas) {
        console.log(canvas);

        const scene = new Scene();
        const camera = new PerspectiveCamera(75, canvas.scrollWidth / canvas.scrollHeight, 0.1, 1000);
        

        const renderer = new WebGLRenderer({
            canvas,
            antialias: true,
        });
        renderer.setSize(canvas.scrollWidth, canvas.scrollHeight);
        renderer.setClearColor(new Color('red'));

        renderer.render(scene, camera);
    }
}
