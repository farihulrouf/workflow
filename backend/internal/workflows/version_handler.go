package workflows

import (
	"flowforge/internal/database"
	"flowforge/internal/models"

	"github.com/gofiber/fiber/v2"
	jwt "github.com/golang-jwt/jwt/v4"
)

func GetWorkflowVersions(c *fiber.Ctx) error {

	id := c.Params("id")

	user := c.Locals("user").(*jwt.Token)

	claims := user.Claims.(jwt.MapClaims)

	tenantID := uint(claims["tenant_id"].(float64))

	var versions []models.WorkflowVersion

	result := database.DB.
		Joins("JOIN workflows ON workflows.id = workflow_versions.workflow_id").
		Where(
			"workflow_versions.workflow_id = ? AND workflows.tenant_id = ?",
			id,
			tenantID,
		).
		Order("workflow_versions.version desc").
		Find(&versions)

	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "failed to fetch versions",
		})
	}

	return c.JSON(versions)
}
