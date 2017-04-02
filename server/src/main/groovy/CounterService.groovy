class CounterService {

    static INCREMENT = '[Counter] Increment'
    static DECREMENT = '[Counter] Decrement'
    static RESET = '[Counter] ResetSucess'

    int total = 0

    void handleEvent(event) {
        switch(event.type) {
            case INCREMENT:
                total++
                break
            case DECREMENT:
                total--
                break
            case RESET:
                total = 0
                break
        }
    }

}
