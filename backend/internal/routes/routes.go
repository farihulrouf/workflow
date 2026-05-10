package routes

import (
	"flowforge/internal/auth"
	"flowforge/internal/handlers"
	"flowforge/internal/middleware"
	"flowforge/internal/realtime"
	"flowforge/internal/workflows"

	"github.com/gofiber/fiber/v2"
)

func Setup(app *fiber.App) {

	// =========================
	// HEALTH CHECK
	// =========================

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

	// =========================
	// WORKFLOW RUN ROUTES
	// =========================

	app.Get(
		"/workflow-runs",
		middleware.Protected(),
		workflows.GetWorkflowRuns,
	)

	app.Get(
		"/workflow-runs/:id",
		middleware.Protected(),
		workflows.GetWorkflowRun,
	)

	// =========================
	// REALTIME
	// =========================

	app.Get(
		"/events",
		realtime.StreamEvents,
	)

	app.Get(
		"/logs/stream",
		handlers.StreamLogs,
	)
}
