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

	app.Post(
		"/register",
		auth.Register,
	)

	app.Post(
		"/login",
		auth.Login,
	)

	// =========================
	// AUTH TEST
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

	// Get all workflows
	app.Get(
		"/workflows",
		middleware.Protected(),
		workflows.GetWorkflows,
	)

	// Get single workflow
	app.Get(
		"/workflows/:id",
		middleware.Protected(),
		workflows.GetWorkflow,
	)

	// Update workflow
	app.Put(
		"/workflows/:id",
		middleware.Protected(),
		workflows.UpdateWorkflow,
	)

	// Delete workflow
	app.Delete(
		"/workflows/:id",
		middleware.Protected(),
		workflows.DeleteWorkflow,
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

	// Get all runs
	app.Get(
		"/workflow-runs",
		middleware.Protected(),
		workflows.GetWorkflowRuns,
	)

	// Get single run
	app.Get(
		"/workflow-runs/:id",
		middleware.Protected(),
		workflows.GetWorkflowRun,
	)

	// =========================
	// REALTIME ROUTES
	// =========================

	// SSE events
	app.Get(
		"/events",
		realtime.StreamEvents,
	)

	// Logs stream
	app.Get(
		"/logs/stream",
		handlers.StreamLogs,
	)
}
