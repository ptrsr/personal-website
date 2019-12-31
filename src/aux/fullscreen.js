export default class Fullscreen {
    constructor(element, fullscreenChange) {
        this.element = element;

        const onChange = function() {
            const isFullscreen = document.webkitIsFullScreen || document.mozFullScreen || false;
            fullscreenChange(isFullscreen);
        }
        document.addEventListener('fullscreenchange', onChange, false);
        document.addEventListener('mozfullscreenchange', onChange, false);
        document.addEventListener('MSFullscreenChange', onChange, false);
        document.addEventListener('webkitfullscreenchange', onChange, false)
    }

    toggle = () => {
        console.log(true)
        this.element.requestFullScreen = this.element.requestFullScreen || this.element.webkitRequestFullScreen || this.element.mozRequestFullScreen || function () { return false; };
        document.cancelFullScreen = document.cancelFullScreen || document.webkitCancelFullScreen || document.mozCancelFullScreen || function () { return false; };
    
        const isFullscreen = document.webkitIsFullScreen || document.mozFullScreen || false;
        isFullscreen ? document.cancelFullScreen() : this.element.requestFullScreen();
    }
}
