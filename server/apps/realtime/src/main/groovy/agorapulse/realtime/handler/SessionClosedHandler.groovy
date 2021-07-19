package agorapulse.realtime.handler

import agorapulse.realtime.model.Event
import agorapulse.realtime.service.CounterService
import groovy.transform.CompileStatic
import groovy.util.logging.Slf4j
import io.micronaut.context.event.ApplicationEventListener

import javax.inject.Singleton

@Slf4j
@CompileStatic
@Singleton
class SessionClosedHandler implements ApplicationEventListener<Event> {

    final CounterService counterService

    SessionClosedHandler(CounterService counterService) {
        this.counterService = counterService
    }

    @Override
    void onApplicationEvent(Event event) {
        log.debug "Handling session close event: {}", event

        counterService.unregister(event.connectionId)
    }

    @Override
    boolean supports(Event event) {
        return event.type == Event.Type.CLOSE
    }
}
