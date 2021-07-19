package agorapulse.realtime.service

import groovy.transform.CompileStatic

import javax.inject.Singleton
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.atomic.AtomicInteger

@CompileStatic
@Singleton
class CounterService {

    private final Map<String, AtomicInteger> storage = new ConcurrentHashMap<>()

    void registerUser(String user) {
        storage.putIfAbsent(user, new AtomicInteger(0))
    }

    int increment(String user) {
        return storage.get(user).incrementAndGet()
    }

    int decrement(String user) {
        return storage.get(user).decrementAndGet()
    }

    int reset(String user) {
        return storage.put(user, new AtomicInteger(0)).get()
    }

    int currentTotal(String user) {
        return storage.get(user, new AtomicInteger(0)).get()
    }

    void unregister(String user) {
        storage.remove(user)
    }
}
