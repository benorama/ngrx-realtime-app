package agorapulse.realtime.model

import groovy.transform.CompileStatic
import groovy.transform.ToString

@CompileStatic
@ToString(includeFields = true)
class Event {

    Type type
    String connectionId
    Message message

    static enum Type {
        OPEN,
        MESSAGE,
        CLOSE
    }
}
