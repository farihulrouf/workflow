package main

import (
	"log"

	"flowforge/internal/database"
	"flowforge/internal/realtime"
	"flowforge/internal/routes"
	"flowforge/internal/scheduler"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
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
	database.Seed()

	// =========================
	// INIT REDIS
	// =========================

	realtime.InitRedis()

	// =========================
	// START REALTIME BROKER
	// =========================

	realtime.StartBroker()

	// =========================
	// START REDIS SUBSCRIBER
	// =========================

	go realtime.SubscribeEvents()

	// =========================
	// CREATE FIBER APP
	// =========================

	app := fiber.New()

	// =========================
	// CORS
	// =========================

	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowMethods: "GET,POST,HEAD,PUT,DELETE,PATCH,OPTIONS",
		AllowHeaders: "*",
	}))

	// =========================
	// SETUP ROUTES
	// =========================

	routes.Setup(app)

	// =========================
	// START CRON SCHEDULER
	// =========================

	scheduler.StartScheduler()

	// =========================
	// START SERVER
	// =========================

	log.Fatal(app.Listen(":8080"))
}
