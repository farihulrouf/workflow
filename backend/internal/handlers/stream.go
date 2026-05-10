package handlers

import (
	"bufio"
	"encoding/json"
	"fmt"
	"time"

	"github.com/gofiber/fiber/v2"
)

type Event struct {
	Message string `json:"message"`
	Time    string `json:"time"`
}

func StreamLogs(c *fiber.Ctx) error {

	c.Set("Content-Type", "text/event-stream")
	c.Set("Cache-Control", "no-cache")
	c.Set("Connection", "keep-alive")
	c.Set("Transfer-Encoding", "chunked")

	c.Context().SetBodyStreamWriter(func(w *bufio.Writer) {

		ticker := time.NewTicker(2 * time.Second)
		defer ticker.Stop()

		for {
			select {

			case t := <-ticker.C:

				event := Event{
					Message: "workflow running",
					Time:    t.Format(time.RFC3339),
				}

				jsonData, err := json.Marshal(event)
				if err != nil {
					return
				}

				_, err = fmt.Fprintf(w, "data: %s\n\n", jsonData)
				if err != nil {
					return
				}

				err = w.Flush()
				if err != nil {
					return
				}
			}
		}
	})

	return nil
}
