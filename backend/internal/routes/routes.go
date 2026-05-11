package routes

import (
	"flowforge/internal/auth"
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

	app.Post(
		"/workflows",
		middleware.Protected(),
		middleware.RequireRoles("admin", "editor"),
		workflows.CreateWorkflow,
	)

	app.Get(
		"/workflows",
		middleware.Protected(),
		workflows.GetWorkflows,
	)

	app.Get(
		"/workflows/:id",
		middleware.Protected(),
		workflows.GetWorkflow,
	)

	app.Put(
		"/workflows/:id",
		middleware.Protected(),
		middleware.RequireRoles("admin", "editor"),
		workflows.UpdateWorkflow,
	)

	app.Delete(
		"/workflows/:id",
		middleware.Protected(),
		middleware.RequireRoles("admin"),
		workflows.DeleteWorkflow,
	)

	app.Get(
		"/workflows/:id/versions",
		middleware.Protected(),
		workflows.GetWorkflowVersions,
	)

	app.Post(
		"/workflows/:id/rollback/:versionId",
		middleware.Protected(),
		middleware.RequireRoles("admin", "editor"),
		workflows.RollbackWorkflow,
	)

	app.Post(
		"/workflows/:id/run",
		middleware.Protected(),
		middleware.RequireRoles("admin", "editor"),
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
	app.Get(
		"/health/metrics",
		middleware.Protected(),
		workflows.GetHealthMetrics,
	)
	app.Post(
		"/webhooks/:id",
		workflows.TriggerWorkflowWebhook,
	)
	// =========================
	// REALTIME ROUTES
	// =========================

	app.Get(
		"/events",
		realtime.StreamEvents,
	)
}
