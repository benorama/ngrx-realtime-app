package agorapulse.realtime.handler

import agorapulse.realtime.model.Event
import agorapulse.realtime.model.Message
import groovy.transform.CompileStatic
import groovy.util.logging.Slf4j
import io.micronaut.context.event.ApplicationEventListener

import javax.inject.Singleton

@CompileStatic
@Singleton
@Slf4j
class PingMessageHandler implements ApplicationEventListener<Event> {
    @Override
    void onApplicationEvent(Event event) {
        log.debug "Event received: {}", event
    }

    @Override
    boolean supports(Event event) {
        return event.message && Message.Type.PING == event.message.type
    }
}
