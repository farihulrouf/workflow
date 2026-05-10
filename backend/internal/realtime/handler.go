package realtime

import (
	"bufio"
	"fmt"

	"github.com/gofiber/fiber/v2"
)

func StreamEvents(c *fiber.Ctx) error {

	fmt.Println("New SSE Connection")

	c.Set("Content-Type", "text/event-stream")
	c.Set("Cache-Control", "no-cache")
	c.Set("Connection", "keep-alive")

	client := make(chan string)

	Clients[client] = true

	fmt.Println("Client registered")

	c.Context().SetBodyStreamWriter(func(w *bufio.Writer) {

		fmt.Println("SSE Stream Started")

		defer func() {

			fmt.Println("Client disconnected")

			delete(Clients, client)

			close(client)
		}()

		for {

			message := <-client

			fmt.Println("Writing message:", message)

			fmt.Fprintf(
				w,
				"data: %s\n\n",
				message,
			)

			err := w.Flush()

			if err != nil {

				fmt.Println("Flush error:", err)

				return
			}
		}
	})

	return nil
}
