package realtime

import (
	"bufio"
	"fmt"

	"github.com/gofiber/fiber/v2"
)

func StreamEvents(c *fiber.Ctx) error {

	c.Set("Content-Type", "text/event-stream")
	c.Set("Cache-Control", "no-cache")
	c.Set("Connection", "keep-alive")
	c.Set("Transfer-Encoding", "chunked")

	client := make(chan string)

	Clients[client] = true

	defer func() {
		delete(Clients, client)
		close(client)
	}()

	c.Context().SetBodyStreamWriter(func(w *bufio.Writer) {

		for {
			message := <-client

			fmt.Fprintf(
				w,
				"data: %s\n\n",
				message,
			)

			w.Flush()
		}
	})

	return nil
}
