/** EventQueue class
 * - creates an event-queue to handel one given event-name
 * in a queue for an element; where one event will be handled at a time
 * in an async way.
 * - when event-name occurs start queue processing if the 
 * queue is not already processing.
  */
class EventQueue {
    constructor(element, eventName, handler) {
        this.eventQueue = [];
        this.isProcessing = false;
        this.handler = handler;

        // bind the event listener to the element
        element.addEventListener(eventName, (e) => this.addEventToQueue(e));
    }

    // add events to the queue
    addEventToQueue(event) {
        this.eventQueue.push(event);
        if (!this.isProcessing) {
            this.processQueue();
        }
    }

    // process the queue
    async processQueue() {
        this.isProcessing = true;

        while (this.eventQueue.length > 0) {
            const currentEvent = this.eventQueue.shift();

            // call the provided handler with the current event
            await this.handler(currentEvent);
        }

        this.isProcessing = false;
    }
}