package agorapulse.realtime.model

import groovy.transform.CompileStatic
import groovy.transform.ToString

@CompileStatic
@ToString(includeFields = true)
class Message {
    Type type
    String address
    Body body
    Map<String,Object> headers

    static enum Type {
        PING,
        REGISTER,
        SEND,
        PUBLISH
    }

    @CompileStatic
    @ToString(includeFields = true)
    static class Body {
        String eventBusAddress
        String type
        String publishedByUser
        Map<String,Object> payload
    }
}
