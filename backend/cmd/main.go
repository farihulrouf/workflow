package main

import (
	"log"

	"flowforge/internal/auth"
	"flowforge/internal/database"
	"flowforge/internal/middleware"
	"flowforge/internal/workflows"

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
	app.Post("/login", auth.Login)

	// Protected Routes
	app.Get(
		"/me",
		middleware.Protected(),
		func(c *fiber.Ctx) error {
			return c.JSON(fiber.Map{
				"message": "authenticated",
			})
		},
	)

	// Workflow Routes
	app.Post(
		"/workflows",
		middleware.Protected(),
		workflows.CreateWorkflow,
	)

	// Start Server
	log.Fatal(app.Listen(":8080"))
}
