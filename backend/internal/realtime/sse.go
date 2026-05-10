package realtime

import (
	"fmt"
)

var Clients = make(map[chan string]bool)

var Broadcast = make(chan string)

func StartBroker() {
	go func() {
		for {
			message := <-Broadcast

			for client := range Clients {
				client <- message
			}
		}
	}()
}

func SendEvent(message string) {
	fmt.Println("SSE Event:", message)

	Broadcast <- message
}
