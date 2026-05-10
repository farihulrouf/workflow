package realtime

import (
	"fmt"
)

// =========================
// CLIENT STORAGE
// =========================

var Clients = make(map[chan string]bool)

// =========================
// BROADCAST CHANNEL
// =========================

var Broadcast = make(chan string)

// =========================
// START SSE BROKER
// =========================

func StartBroker() {

	fmt.Println("SSE Broker Started")

	go func() {

		for {

			message := <-Broadcast

			fmt.Println("Broadcasting:", message)

			for client := range Clients {

				fmt.Println("Send to client")

				client <- message
			}
		}
	}()
}

// =========================
// SEND EVENT
// =========================

func SendEvent(message string) {

	fmt.Println("SSE Event:", message)

	Broadcast <- message
}
