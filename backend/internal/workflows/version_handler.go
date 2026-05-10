package workflows

import (
	"flowforge/internal/database"
	"flowforge/internal/models"

	"github.com/gofiber/fiber/v2"
)

func GetWorkflowVersions(c *fiber.Ctx) error {

	id := c.Params("id")

	var versions []models.WorkflowVersion

	result := database.DB.
		Where("workflow_id = ?", id).
		Order("version desc").
		Find(&versions)

	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "failed to fetch versions",
		})
	}

	return c.JSON(versions)
}
