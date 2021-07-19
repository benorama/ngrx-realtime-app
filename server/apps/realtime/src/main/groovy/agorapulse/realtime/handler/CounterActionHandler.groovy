package agorapulse.realtime.handler

import agorapulse.realtime.model.Event
import agorapulse.realtime.model.Message
import agorapulse.realtime.service.CounterService
import groovy.transform.CompileStatic
import groovy.util.logging.Slf4j
import io.micronaut.context.event.ApplicationEventListener
import io.micronaut.websocket.WebSocketBroadcaster

import javax.inject.Singleton

@Slf4j
@Singleton
@CompileStatic
class CounterActionHandler implements ApplicationEventListener<Event> {

    public static final String ACTION_INCREMENT = "[Counter] Increment"
    public static final String ACTION_DECREMENT = "[Counter] Decrement"
    public static final String ACTION_RESET = "[Counter] Reset"

    final WebSocketBroadcaster broadcaster
    final CounterService counterService

    CounterActionHandler(WebSocketBroadcaster broadcaster, CounterService counterService) {
        this.broadcaster = broadcaster
        this.counterService = counterService
    }

    @Override
    void onApplicationEvent(Event event) {
        log.debug "Handling counter action event: {}", event

        switch (event.message.body.type) {
            case ACTION_INCREMENT:
                counterService.increment(event.connectionId)
                break

            case ACTION_DECREMENT:
                counterService.decrement(event.connectionId)
                break

            case ACTION_RESET:
                counterService.reset(event.connectionId)
                break
        }

        broadcaster.broadcastAsync([
            total: counterService.currentTotal(event.connectionId)
        ], { session -> session.id == event.connectionId })
    }

    @Override
    boolean supports(Event event) {
        return event.type == Event.Type.MESSAGE &&
            event.message &&
            event.message.type == Message.Type.PUBLISH &&
            event.message.address == "counter::actions" &&
            event.connectionId
    }
}
