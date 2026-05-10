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

	// =========================
	// AUTH ROUTES
	// =========================

	app.Post("/register", auth.Register)
	app.Post("/login", auth.Login)

	// =========================
	// PROTECTED TEST ROUTE
	// =========================

	app.Get(
		"/me",
		middleware.Protected(),
		func(c *fiber.Ctx) error {
			return c.JSON(fiber.Map{
				"message": "authenticated",
			})
		},
	)

	// =========================
	// WORKFLOW ROUTES
	// =========================

	// Create workflow
	app.Post(
		"/workflows",
		middleware.Protected(),
		workflows.CreateWorkflow,
	)

	// Run workflow
	app.Post(
		"/workflows/:id/run",
		middleware.Protected(),
		workflows.RunWorkflow,
	)

	// =========================
	// WORKFLOW RUN ROUTES
	// =========================

	// Get all workflow runs
	app.Get(
		"/workflow-runs",
		middleware.Protected(),
		workflows.GetWorkflowRuns,
	)

	// Get workflow run detail
	app.Get(
		"/workflow-runs/:id",
		middleware.Protected(),
		workflows.GetWorkflowRun,
	)

	// =========================
	// START SERVER
	// =========================

	log.Fatal(app.Listen(":8080"))
}
