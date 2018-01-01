import io.vertx.core.eventbus.EventBus
import io.vertx.core.eventbus.Message
import io.vertx.ext.bridge.BridgeEventType
import io.vertx.ext.web.Router
import io.vertx.ext.web.handler.sockjs.BridgeEvent
import io.vertx.ext.web.handler.sockjs.SockJSHandler

// Create counter service singleton
CounterService counterService = new CounterService()

// Allow events for the designated addresses in/out of the event bus bridge
Map options = [
        inboundPermitteds:[
                [address: 'counter::actions'],
                [address: 'counter::total']
        ],
        outboundPermitteds: [
                [address: 'counter::actions']
        ]
]

// Create the event bus bridge and add it to the router.
SockJSHandler sockJSHandler = SockJSHandler.create(vertx)
sockJSHandler.bridge(options, { BridgeEvent event ->
    Map message = event.rawMessage
    println "Bridge event: ${event.type()} ${message}"
    if (event.type() == BridgeEventType.PUBLISH) {
        println event
        counterService.handleEvent(message.body)
    }
    event.complete(true)
})

Router router = Router.router(vertx)
router.route("/eventbus/*").handler(sockJSHandler)

vertx.createHttpServer().requestHandler(router.&accept).listen(8080)

println("Server is started")

EventBus eb = vertx.eventBus()
eb.consumer("counter::total", { Message message ->
    def action = message.body()
    println "Received counter::total ${action}"
    println "Current total ${counterService.total}"
    message.reply([total: counterService.total])
})
