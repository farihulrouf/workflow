package main

import (
	"log"

	"flowforge/internal/database"
	"flowforge/internal/queue"
	"flowforge/internal/realtime"
	"flowforge/internal/routes"

	"github.com/gofiber/fiber/v2"
	"github.com/joho/godotenv"
)

func main() {

	// =========================
	// LOAD ENV
	// =========================

	err := godotenv.Load()

	if err != nil {
		log.Fatal("Error loading .env")
	}

	// =========================
	// CONNECT DATABASE
	// =========================

	database.ConnectDB()

	// =========================
	// START REALTIME BROKER
	// =========================

	realtime.StartBroker()

	// =========================
	// START QUEUE WORKER
	// =========================

	queue.StartWorker()

	// =========================
	// CREATE FIBER APP
	// =========================

	app := fiber.New()

	// =========================
	// SETUP ROUTES
	// =========================

	routes.Setup(app)

	// =========================
	// START SERVER
	// =========================

	log.Fatal(app.Listen(":8080"))
}
