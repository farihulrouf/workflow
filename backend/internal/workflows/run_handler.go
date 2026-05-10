package workflows

import (
	"flowforge/internal/database"
	"flowforge/internal/models"
	"flowforge/internal/queue"

	"github.com/gofiber/fiber/v2"
)

func RunWorkflow(c *fiber.Ctx) error {

	id := c.Params("id")

	var workflow models.Workflow

	result := database.DB.First(
		&workflow,
		id,
	)

	if result.Error != nil {
		return c.Status(404).JSON(fiber.Map{
			"error": "workflow not found",
		})
	}

	// =========================
	// PUSH TO QUEUE
	// =========================

	queue.Enqueue(queue.Job{
		WorkflowID: workflow.ID,
	})

	// =========================
	// RESPONSE
	// =========================

	return c.JSON(fiber.Map{
		"message": "workflow added to queue",
	})
}

func GetWorkflowRuns(c *fiber.Ctx) error {

	var runs []models.WorkflowRun

	database.DB.Order("id desc").Find(&runs)

	return c.JSON(runs)
}

func GetWorkflowRun(c *fiber.Ctx) error {

	id := c.Params("id")

	var run models.WorkflowRun

	result := database.DB.First(
		&run,
		id,
	)

	if result.Error != nil {
		return c.Status(404).JSON(fiber.Map{
			"error": "run not found",
		})
	}

	var steps []models.StepRun

	database.DB.Where(
		"workflow_run_id = ?",
		run.ID,
	).Find(&steps)

	return c.JSON(fiber.Map{
		"run":   run,
		"steps": steps,
	})
}
