package main

import (
	"log"

	"flowforge/internal/database"
	"flowforge/internal/realtime"
	"flowforge/internal/routes"

	"github.com/gofiber/fiber/v2"
	"github.com/joho/godotenv"
)

func main() {

	// Load environment variables
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env")
	}

	// Connect database
	database.ConnectDB()

	// Start realtime broker
	realtime.StartBroker()

	// Create Fiber app
	app := fiber.New()

	// Setup routes
	routes.Setup(app)

	// Start server
	log.Fatal(app.Listen(":8080"))
}
