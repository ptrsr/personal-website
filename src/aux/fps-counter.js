

export default class FPSCounter {
    constructor(parentElement, sampleCount = 60) {
        const element = document.createElement('div');
        element.innerHTML = "0";
        element.style.color = "white";
        parentElement.appendChild(element);
        
        this.sampleCount = sampleCount;
        this.element = element;
        this.samples = [];
        this.lastUpdate = 0;
    }

    record = (sample) => {
        // amount of seconds for each fps update
        const updateRate = 0.1;

        // only track the last samples
        if (this.samples.length > this.sampleCount) {
            this.samples.shift();
        }
        // push new sample
        this.samples.push(sample);

        // check when last FPS update occured, return if update is not yet required
        this.lastUpdate += sample;
        if (this.lastUpdate < updateRate) {
            return;
        }
        this.lastUpdate %= updateRate;

        // total of samples
        let total = 0;
        for (let i = 0; i < this.samples.length; i++) {
            total += this.samples[i];
        }
        // average of samples
        const average = 1 / (total / this.samples.length);

        // update FPS text
        const text = parseInt(average);
        this.element.innerHTML = `${text}`;
    }
}
