import {EventEmitter, Injectable} from '@angular/core';
import {ObservableWebSocket} from './observable-web-socket.model';

@Injectable()
export class EventBusService {

    static initialized = false;
    static MAX_EVENT_QUEUE_SIZE = 100;
    static STATE_CONNECTING = 0;
    static STATE_OPEN = 1;
    static STATE_CLOSING = 2;
    static STATE_CLOSED = 3;
    static TYPE_PUBLISH = 'publish';
    static TYPE_SEND = 'send';
    static TYPE_REGISTER = 'register';
    static TYPE_REGISTER_HANDLER = 'registerHandler';
    static TYPE_UNREGISTER = 'unregister';
    static TYPE_UNREGISTER_HANDLER = 'unregisterHandler';

    public close: EventEmitter<any> = new EventEmitter<any>();
    public open: EventEmitter<any> = new EventEmitter<any>();
    public reconnect: EventEmitter<any> = new EventEmitter<any>();
    private webSocket: ObservableWebSocket;

    private defaultHeaders: any;
    private eventQueue: QueuedEvent[];
    private handlers: any = {};
    private replyHandlers: any = {};
    private state: number;

    private pingInterval = 5000;
    private pingTimerID = null;

    private maxReconnectAttempts = Infinity;
    private randomizationFactor = 0.5;
    private reconnectAttempts = 0;
    private reconnectDelayMax = 5000;
    private reconnectDelayMin = 1000;
    private reconnectEnabled = false;
    private reconnectExponent = 2;
    private reconnectTimerID = null;

    constructor() {
        if (EventBusService.initialized) {
            throw new Error('Only one vertx eventBus can exist per application.');
        }
        EventBusService.initialized = true;
    }

    get connected(): boolean {
        return this.state === EventBusService.STATE_OPEN;
    }

    connect(url: string, defaultHeaders: any = null, options: any = {}): void {
        this.pingInterval = options.vertxbus_ping_interval || 5000;

        this.maxReconnectAttempts = options.vertxbus_reconnect_attempts_max || Infinity;
        this.randomizationFactor = options.vertxbus_randomization_factor || 0.5;
        this.reconnectAttempts = 0;
        this.reconnectDelayMax = options.vertxbus_reconnect_delay_max || 5000;
        this.reconnectDelayMin = options.vertxbus_reconnect_delay_min || 1000;
        this.reconnectExponent = options.vertxbus_reconnect_exponent || 2;
        this.reconnectTimerID = null;

        this.defaultHeaders = defaultHeaders;
        this.eventQueue = [];
        this.handlers = {};
        this.replyHandlers = {};

        this.webSocket = new ObservableWebSocket(url);
        this.webSocket.state.subscribe((state) => {
            switch (state) {
                case WebSocket.OPEN:
                    this.state = EventBusService.STATE_OPEN;
                    // this.pingEnabled(true);
                    this.enablePing(true);
                    this.flushEventQueue();
                    this.open.emit(null);
                    break;
                case WebSocket.CLOSED:
                    this.state = EventBusService.STATE_CLOSED;
                    this.enablePing(false);
                    this.close.emit(null);
                    break;

            }
        });

        this.webSocket.messages.subscribe((message) => {
            const json = JSON.parse(message);

            // define a reply function on the message itself
            if (json.replyAddress) {
                Object.defineProperty(json, 'reply', {
                    value: function (message, headers, callback) {
                        this.send(json.replyAddress, message, headers, callback);
                    }
                });
            }

            if (this.handlers[json.address]) {
                // iterate all registered handlers
                const handlers = this.handlers[json.address];
                for (let i = 0; i < handlers.length; i++) {
                    if (json.type === 'err') {
                        handlers[i]({
                            failureCode: json.failureCode,
                            failureType: json.failureType,
                            message: json.message
                        });
                    } else {
                        handlers[i](null, json);
                    }
                }
            } else if (this.replyHandlers[json.address]) {
                // Might be a reply message
                const handler = this.replyHandlers[json.address];
                delete this.replyHandlers[json.address];
                if (json.type === 'err') {
                    handler({failureCode: json.failureCode, failureType: json.failureType, message: json.message});
                } else {
                    handler(null, json);
                }
            } else {
                if (json.type === 'err') {
                    try {
                        console.error(json);
                    } catch (e) {
                        // dev tools are disabled so we cannot use console on IE
                    }
                } else {
                    try {
                        console.warn('No handler found for message: ', json);
                    } catch (e) {
                        // dev tools are disabled so we cannot use console on IE
                    }
                }
            }
        });

        this.webSocket.connect();
    }

    disconnect() {
        if (this.webSocket) {
            this.webSocket.disconnect();
        }
    }

    enableReconnect(enabled) {
        this.reconnectEnabled = enabled;
        if (!enabled && this.reconnectTimerID) {
            clearTimeout(this.reconnectTimerID);
            this.reconnectTimerID = null;
            this.reconnectAttempts = 0;
        }
    }

    enablePing(enabled) {
        if (enabled) {
            const sendPing = () => {
                this.webSocket.send(JSON.stringify({type: 'ping'}));
            };

            if (this.pingInterval > 0) {
                // Send the first ping then send a ping every pingInterval milliseconds
                sendPing();
                this.pingTimerID = setInterval(sendPing, this.pingInterval);
            }
        } else {
            if (this.pingTimerID) {
                clearInterval(this.pingTimerID);
                this.pingTimerID = null;
            }
        }
    }

    /**
     * Publish a message
     *
     * @param {String} address
     * @param {Object} body
     * @param {Object} [headers]
     */
    publish(address: string,
            body: any,
            headers?: any) {
        if (this.connected) {
            const message: any = {
                address: address,
                body: body,
                headers: mergeHeaders(this.defaultHeaders, headers),
                type: EventBusService.TYPE_PUBLISH
            };

            this.webSocket.send(JSON.stringify(message));
        } else {
            this.addEventToQueue({address, body, type: EventBusService.TYPE_PUBLISH});
        }
    }

    /**
     * Send a message
     *
     * @param {String} address
     * @param {Object} body
     * @param {Function} [replyHandler]
     * @param {Object} [headers]
     */
    send<T>(address: string,
            body: any,
            replyHandler?: Function,
            headers?: any): void {
        if (this.connected) {
            const message: any = {
                address: address,
                body: body,
                headers: mergeHeaders(this.defaultHeaders, headers),
                type: EventBusService.TYPE_SEND
            };

            if (replyHandler) {
                const replyAddress = makeUUID();
                message.replyAddress = replyAddress;
                this.replyHandlers[replyAddress] = replyHandler;
            }

            this.webSocket.send(JSON.stringify(message));
        } else {
            this.addEventToQueue({address, handler: replyHandler, body, type: EventBusService.TYPE_SEND});
        }
    }

    /*sendWithTimeout<T>(address: string, message: any, timeout: number, replyHandler?: Function): EventBus {
     return this.eventBus.sendWithTimeout(address, message, replyHandler);
     };
     setDefaultReplyTimeout(millis: number): EventBus {
     return this.eventBus.setDefaultReplyTimeout(millis);
     };*/

    /**
     *
     * @param address
     * @param headers
     */
    register<T>(address: string,
                headers?: any): void {
        if (this.connected) {
            const envelope: any = {
                address: address,
                headers: mergeHeaders(this.defaultHeaders, headers),
                type: EventBusService.TYPE_REGISTER
            };

            this.webSocket.send(JSON.stringify(envelope));
        }
    }

    /**
     * Register a new handler
     *
     * @param {String} address
     * @param {Function} handler
     * @param {Object} [headers]
     */
    registerHandler<T>(address: string,
                       handler: Function,
                       headers?: any): void {
        if (this.connected) {
            // ensure it is an array
            if (!this.handlers[address]) {
                this.handlers[address] = [];
                // First handler for this address so we should register the connection
                this.register(address, headers);
            }

            this.handlers[address].push(handler);
        } else {
            this.addEventToQueue({address, handler, type: EventBusService.TYPE_REGISTER_HANDLER});
        }
    }

    /**
     *
     * @param address
     * @param headers
     */
    unregister<T>(address: string,
                  headers?: any): void {
        if (this.connected) {
            const envelope: any = {
                address: address,
                headers: mergeHeaders(this.defaultHeaders, headers),
                type: EventBusService.TYPE_UNREGISTER
            };

            this.webSocket.send(JSON.stringify(envelope));
        }

        delete this.handlers[address];
    }

    /**
     * Unregister a handler
     *
     * @param {String} address
     * @param {Function} handler
     * @param {Object} [headers]
     */
    unregisterHandler<T>(address: string,
                         handler: Function,
                         headers?: any): void {
        if (this.connected) {
            const handlers = this.handlers[address];

            if (handlers) {
                const idx = handlers.indexOf(handler);
                if (idx !== -1) {
                    handlers.splice(idx, 1);
                    if (handlers.length === 0) {
                        // No more local handlers so we should unregister the connection
                        this.unregister(address, headers);
                    }
                }
            }
        } else {
            this.addEventToQueue({address, handler, type: EventBusService.TYPE_UNREGISTER});
        }
    }

    // PRIVATE

    private addEventToQueue(event) {
        if (!this.eventQueue) {
            return;
        }
        this.eventQueue.push(event);
        if (this.eventQueue.length > EventBusService.MAX_EVENT_QUEUE_SIZE) {
            // Remove oldest events from the queue
            this.eventQueue.splice(0, this.eventQueue.length - EventBusService.MAX_EVENT_QUEUE_SIZE);
        }
    }

    private getReconnectDelay() {
        let ms = this.reconnectDelayMin * Math.pow(this.reconnectExponent, this.reconnectAttempts);
        if (this.randomizationFactor) {
            const rand = Math.random();
            const deviation = Math.floor(rand * this.randomizationFactor * ms);
            ms = (Math.floor(rand * 10) & 1) === 0 ? ms - deviation : ms + deviation;
        }
        return Math.min(ms, this.reconnectDelayMax) | 0;
    }

    private flushEventQueue() {
        if (!this.connected) {
            return;
        }
        while (this.eventQueue.length > 0) {
            const event: QueuedEvent = this.eventQueue.shift();
            switch (event.type) {
                case EventBusService.TYPE_PUBLISH:
                    this.publish(event.address, event.body);
                    break;
                case EventBusService.TYPE_REGISTER_HANDLER:
                    this.registerHandler(event.address, event.handler);
                    break;
                case EventBusService.TYPE_UNREGISTER_HANDLER:
                    this.unregisterHandler(event.address, event.handler);
                    break;
            }
        }
    }

}

interface QueuedEvent {
    address: string;
    body: any; // Only for PUBLISH/SEND events
    handler: Function; // Only for REGISTER/SEND events
    headers: any;
    type: string;
}

function makeUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (a, b) {
        return b = Math.random() * 16, (a === 'y' ? b & 3 | 8 : b | 0).toString(16);
    });
}

function mergeHeaders(defaultHeaders, headers) {
    if (defaultHeaders) {
        if (!headers) {
            return defaultHeaders;
        }

        for (const headerName in defaultHeaders) {
            if (defaultHeaders.hasOwnProperty(headerName)) {
                // user can overwrite the default headers
                if (typeof headers[headerName] === 'undefined') {
                    headers[headerName] = defaultHeaders[headerName];
                }
            }
        }
    }

    // headers are required to be a object
    return headers || {};
}
