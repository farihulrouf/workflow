package main

import (
	"log"

	"flowforge/internal/auth"
	"flowforge/internal/database"

	"github.com/gofiber/fiber/v2"
	"github.com/joho/godotenv"
)

func main() {
	// Load .env
	err := godotenv.Load()

	if err != nil {
		log.Fatal("Error loading .env")
	}

	// Connect Database
	database.ConnectDB()

	// Create Fiber App
	app := fiber.New()

	// Health Check
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status": "ok",
		})
	})

	// Auth Routes
	app.Post("/register", auth.Register)

	// Start Server
	log.Fatal(app.Listen(":8080"))
}
