import { EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';

export class ObservableWebSocket {

    // tslint:disable-next-line:variable-name
    private _messages: EventEmitter<string> = new EventEmitter<string>();
    // tslint:disable-next-line:variable-name
    private _state: EventEmitter<number> = new EventEmitter<number>();

    private reconnectEnabled;
    private reconnectDelay = 5000;
    private ws: WebSocket;

    get messages(): Observable<string> {
        return this._messages;
    }

    get state(): Observable<number> {
        return this._state;
    }

    get connected(): boolean {
        return this.ws && this.ws.readyState === WebSocket.OPEN;
    }
    constructor(private url: string) { }

    public connect(): Observable<string> {
        if (this.ws) {
            this.disconnect();
        }
        this.ws = this.create();
        this.reconnectEnabled = true;
        return this._messages;
    }

    public disconnect(code?: number, reason?: string): void {
        this.reconnectEnabled = false;
        this.ws.close(code, reason);
        this.ws = null;
    }

    public send(message: string): boolean {
        if (!this.ws) {
            throw new Error('WebSocket is not initialized yet!');
        }
        try {
            this.ws.send(message);
            return true;
        } catch (e) {
            return false;
        }
    }

    private create(): WebSocket {
        const ws = new WebSocket(this.url);
        ws.onopen = () => this._state.next(WebSocket.OPEN);
        ws.onmessage = (msg) => this._messages.next(msg.data);
        ws.onerror = (error) => this._messages.error(error);
        ws.onclose = () => {
            this._state.next(WebSocket.CLOSED);
            if (this.reconnectEnabled) {
                this.reconnect();
            }
        };

        return ws;
    }

    private reconnect(): void {
        this.reconnectEnabled = false;
        setTimeout(() => {
            try {
                this.create();
            } catch (e) {
                // if connection failed, try to reconnect again after the delay
                this.reconnect();
            }
        }, this.reconnectDelay);
    }

}
