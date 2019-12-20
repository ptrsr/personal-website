export default class EventHandler {
    constructor(element, state) {

        this.element = element;
        this.state = state;
    }

    addListener(event, func) {
        if (typeof func !== 'function') {
            throw "EventHandler can only bind to functions.";
        }

        this.element.addEventListener(event, (event) => {
            func(this.state, event);
        });
    }
}
