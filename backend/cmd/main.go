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
	// Load environment variables
	err := godotenv.Load()

	if err != nil {
		log.Fatal("Error loading .env")
	}

	// Connect database
	database.ConnectDB()

	// Create Fiber app
	app := fiber.New()

	// Health check
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status": "ok",
		})
	})

	// Auth routes
	app.Post("/register", auth.Register)
	app.Post("/login", auth.Login)

	// Protected route
	app.Get(
		"/me",
		middleware.Protected(),
		func(c *fiber.Ctx) error {
			return c.JSON(fiber.Map{
				"message": "authenticated",
			})
		},
	)

	// Workflow routes
	app.Post(
		"/workflows",
		middleware.Protected(),
		workflows.CreateWorkflow,
	)

	app.Post(
		"/workflows/:id/run",
		middleware.Protected(),
		workflows.RunWorkflow,
	)

	// Start server
	log.Fatal(app.Listen(":8080"))
}
