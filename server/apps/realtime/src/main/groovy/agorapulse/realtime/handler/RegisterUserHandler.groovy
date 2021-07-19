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
class RegisterUserHandler implements ApplicationEventListener<Event> {

    final WebSocketBroadcaster broadcaster
    final CounterService counterService

    RegisterUserHandler(WebSocketBroadcaster broadcaster, CounterService counterService) {
        this.broadcaster = broadcaster
        this.counterService = counterService
    }

    @Override
    void onApplicationEvent(Event event) {
        log.debug "Handling registration event: {}", event

        counterService.registerUser(event.connectionId)

        broadcaster.broadcastAsync([
            message: "User with the connection ${event.connectionId} registered."
        ], { session -> session.id == event.connectionId })
    }

    @Override
    boolean supports(Event event) {
        return event.type == Event.Type.MESSAGE &&
            event.message &&
            event.message.type == Message.Type.REGISTER &&
            event.message.address == "counter::actions" &&
            event.connectionId
    }
}
