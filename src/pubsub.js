export default class PubSubServise {
    constructor() {
        this.eventNames = {}
    }
    subscribe(eventName, listener) {
        if (!this.eventNames[eventName]) {
            this.eventNames[eventName] = []
        }
        this.eventNames[eventName].push(listener)
    }

    publish(eventName, data) {
        const event = this.eventNames[eventName]
        if (!event || !event.length) {
            return;
        }
        event.forEach(listener => listener(data))
    }
}
