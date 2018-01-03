/**
 * Based on Vertx EventBus Client (https://github.com/vert-x3/vertx-bus-bower)
 * Requires SockJS Client
 */

import {EventEmitter, Injectable} from '@angular/core';
import * as SockJS from 'sockjs-client';

@Injectable()
export class EventBusService {

    static initialized: boolean = false;
    static MAX_EVENT_QUEUE_SIZE: number = 100;
    static STATE_CONNECTING: number = 0;
    static STATE_OPEN: number = 1;
    static STATE_CLOSING: number = 2;
    static STATE_CLOSED: number = 3;
    static TYPE_PUBLISH: string = 'publish';
    static TYPE_SEND: string = 'send';
    static TYPE_REGISTER: string = 'register';
    static TYPE_REGISTER_HANDLER: string = 'registerHandler';
    static TYPE_UNREGISTER: string = 'unregister';
    static TYPE_UNREGISTER_HANDLER: string = 'unregisterHandler';

    public close: EventEmitter<any> = new EventEmitter<any>();
    public open: EventEmitter<any> = new EventEmitter<any>();

    private defaultHeaders: any;
    private eventQueue: QueuedEvent[];
    private handlers: any = {};
    private replyHandlers: any = {};
    private sockJS;
    private state: number;

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
        let pingInterval = options.vertxbus_ping_interval || 5000;
        let pingTimerID;

        this.defaultHeaders = defaultHeaders;
        this.eventQueue = [];
        this.handlers = {};
        this.replyHandlers = {};
        this.sockJS = new SockJS(url, null, options);
        this.state = EventBusService.STATE_CONNECTING;

        let sendPing = () => {
            this.sockJS.send(JSON.stringify({type: 'ping'}));
        };

        this.sockJS.onopen = () => {
            this.state = EventBusService.STATE_OPEN;
            // Send the first ping then send a ping every pingInterval milliseconds
            sendPing();
            this.flushEventQueue();
            pingTimerID = setInterval(sendPing, pingInterval);
            this.open.emit(null);
        };

        this.sockJS.onclose = (e) => {
            this.state = EventBusService.STATE_CLOSED;
            if (pingTimerID) clearInterval(pingTimerID);
            this.close.emit(null);
        };

        this.sockJS.onmessage = (e) => {
            let json = JSON.parse(e.data);

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
                let handlers = this.handlers[json.address];
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
                let handler = this.replyHandlers[json.address];
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
        };
    }

    disconnect() {
        if (this.sockJS) {
            this.state = EventBusService.STATE_CLOSING;
            this.sockJS.close();
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
            let message: any = {
                address: address,
                body: body,
                headers: mergeHeaders(this.defaultHeaders, headers),
                type: EventBusService.TYPE_PUBLISH
            };

            this.sockJS.send(JSON.stringify(message));
        } else {
            this.addEventToQueue({address, body, type: EventBusService.TYPE_PUBLISH});
        }
    };

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
            let message: any = {
                address: address,
                body: body,
                headers: mergeHeaders(this.defaultHeaders, headers),
                type: EventBusService.TYPE_SEND
            };

            if (replyHandler) {
                let replyAddress = makeUUID();
                message.replyAddress = replyAddress;
                this.replyHandlers[replyAddress] = replyHandler;
            }

            this.sockJS.send(JSON.stringify(message));
        } else {
            this.addEventToQueue({address, handler: replyHandler, body, type: EventBusService.TYPE_SEND});
        }
    };

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
            let envelope: any = {
                address: address,
                headers: mergeHeaders(this.defaultHeaders, headers),
                type: EventBusService.TYPE_REGISTER
            };

            this.sockJS.send(JSON.stringify(envelope));
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
    };

    /**
     *
     * @param address
     * @param headers
     */
    unregister<T>(address: string,
                  headers?: any): void {
        if (this.connected) {
            let envelope: any = {
                address: address,
                headers: mergeHeaders(this.defaultHeaders, headers),
                type: EventBusService.TYPE_UNREGISTER
            };

            this.sockJS.send(JSON.stringify(envelope));
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
            let handlers = this.handlers[address];

            if (handlers) {
                let idx = handlers.indexOf(handler);
                if (idx != -1) {
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
    };

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

    private flushEventQueue() {
        if (!this.connected) {
            return;
        }
        while (this.eventQueue.length > 0) {
            let event: QueuedEvent = this.eventQueue.shift();
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
        return b = Math.random() * 16, (a == 'y' ? b & 3 | 8 : b | 0).toString(16);
    });
}

function mergeHeaders(defaultHeaders, headers) {
    if (defaultHeaders) {
        if (!headers) {
            return defaultHeaders;
        }

        for (let headerName in defaultHeaders) {
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
