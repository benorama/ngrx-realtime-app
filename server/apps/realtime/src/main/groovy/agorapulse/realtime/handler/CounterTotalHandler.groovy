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
@CompileStatic
@Singleton
class CounterTotalHandler implements ApplicationEventListener<Event> {

    final WebSocketBroadcaster broadcaster
    final CounterService counterService

    CounterTotalHandler(WebSocketBroadcaster broadcaster, CounterService counterService) {
        this.broadcaster = broadcaster
        this.counterService = counterService
    }

    @Override
    void onApplicationEvent(Event event) {
        log.debug "Handling counter total event: {}", event

        broadcaster.broadcastAsync([
            total: counterService.currentTotal(event.connectionId)
        ], { session -> session.id == event.connectionId })
    }

    @Override
    boolean supports(Event event) {
        return event.type == Event.Type.MESSAGE &&
            event.message &&
            event.message.type == Message.Type.SEND &&
            event.message.address == "counter::total"
    }
}
