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
	// DATABASE
	// =========================

	database.ConnectDB()

	// =========================
	// REALTIME BROKER
	// =========================

	realtime.StartBroker()

	// =========================
	// QUEUE WORKER
	// =========================

	queue.StartWorker()

	// =========================
	// FIBER APP
	// =========================

	app := fiber.New()

	// =========================
	// ROUTES
	// =========================

	routes.Setup(app)

	// =========================
	// START SERVER
	// =========================

	log.Fatal(app.Listen(":8080"))
}
