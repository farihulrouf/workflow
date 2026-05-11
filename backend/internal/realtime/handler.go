package realtime

import (
	"bufio"
	"fmt"

	"github.com/gofiber/fiber/v2"
)

func StreamEvents(c *fiber.Ctx) error {

	fmt.Println("New SSE Connection")

	// =========================
	// SSE HEADERS
	// =========================

	c.Set("Content-Type", "text/event-stream")
	c.Set("Cache-Control", "no-cache")
	c.Set("Connection", "keep-alive")
	c.Set("Transfer-Encoding", "chunked")

	// =========================
	// CREATE CLIENT CHANNEL
	// =========================

	client := make(chan string)

	Clients[client] = true

	fmt.Println("Client registered")

	// =========================
	// STREAM WRITER
	// =========================

	c.Context().SetBodyStreamWriter(
		func(w *bufio.Writer) {

			fmt.Println("SSE Stream Started")

			// =========================
			// CLEANUP
			// =========================

			defer func() {

				fmt.Println("Client disconnected")

				delete(Clients, client)

				close(client)
			}()

			// =========================
			// KEEP STREAM ALIVE
			// =========================

			for {

				message, ok := <-client

				if !ok {
					return
				}

				// =========================
				// SEND EVENT
				// =========================

				fmt.Fprintf(
					w,
					"data: %s\n\n",
					message,
				)

				// =========================
				// FLUSH BUFFER
				// =========================

				err := w.Flush()

				if err != nil {

					// Browser disconnected
					return
				}
			}
		},
	)

	return nil
}
