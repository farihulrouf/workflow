package workflows

import (
	"flowforge/internal/database"
	"flowforge/internal/models"
	"flowforge/internal/queue"

	"github.com/gofiber/fiber/v2"
)

func TriggerWorkflowWebhook(c *fiber.Ctx) error {

	id := c.Params("id")

	// =========================
	// FIND WORKFLOW
	// =========================

	var workflow models.Workflow

	result := database.DB.
		Where("id = ?", id).
		First(&workflow)

	if result.Error != nil {

		return c.Status(404).JSON(
			fiber.Map{
				"error": "workflow not found",
			},
		)
	}

	// =========================
	// PUSH TO QUEUE
	// =========================

	err := queue.Enqueue(
		queue.WorkflowJob{
			WorkflowID: workflow.ID,
		},
	)

	if err != nil {

		return c.Status(500).JSON(
			fiber.Map{
				"error": err.Error(),
			},
		)
	}

	// =========================
	// RESPONSE
	// =========================

	return c.JSON(
		fiber.Map{
			"message": "workflow triggered via webhook",
		},
	)
}
