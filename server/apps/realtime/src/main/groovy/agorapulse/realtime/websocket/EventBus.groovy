package agorapulse.realtime.websocket

import agorapulse.realtime.model.Event
import agorapulse.realtime.model.Message
import com.fasterxml.jackson.databind.ObjectMapper
import groovy.transform.CompileStatic
import groovy.util.logging.Slf4j
import io.micronaut.context.event.ApplicationEventPublisher
import io.micronaut.websocket.WebSocketSession
import io.micronaut.websocket.annotation.OnClose
import io.micronaut.websocket.annotation.OnMessage
import io.micronaut.websocket.annotation.OnOpen
import io.micronaut.websocket.annotation.ServerWebSocket

import java.util.concurrent.Future

@Slf4j
@CompileStatic
@ServerWebSocket('/eventbus')
class EventBus {

    final ApplicationEventPublisher publisher
    final ObjectMapper objectMapper

    EventBus(ApplicationEventPublisher publisher, ObjectMapper objectMapper) {
        this.publisher = publisher
        this.objectMapper = objectMapper
    }

    @OnOpen
    Future<Void> onOpen(WebSocketSession session) {
        log.debug "Session opened: {}", session.id

        return publisher.publishEventAsync(new Event(
            type: Event.Type.OPEN,
            connectionId: session.id
        ))
    }

    @OnMessage
    Future<Void> onMessage(String rawMessage, WebSocketSession session) {
        log.debug "Message received ({}): {}", session.id, rawMessage

        final Message message = objectMapper.readValue(rawMessage, Message)

        publisher.publishEventAsync(new Event(
            type: Event.Type.MESSAGE,
            connectionId: session.id,
            message: message
        ))
    }

    @OnClose
    Future<Void> onClose(WebSocketSession session) {
        log.debug "Session closed: {}", session.id

        publisher.publishEventAsync(new Event(
            type: Event.Type.CLOSE,
            connectionId: session.id,
        ))
    }
}
