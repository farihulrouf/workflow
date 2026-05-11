package workflows

import (
	"flowforge/internal/database"
	"flowforge/internal/models"

	"github.com/gofiber/fiber/v2"
	jwt "github.com/golang-jwt/jwt/v4"
)

func RollbackWorkflow(c *fiber.Ctx) error {

	id := c.Params("id")

	versionID := c.Params("versionId")

	user := c.Locals("user").(*jwt.Token)

	claims := user.Claims.(jwt.MapClaims)

	tenantID := uint(claims["tenant_id"].(float64))

	// =========================
	// GET WORKFLOW
	// =========================

	var workflow models.Workflow

	result := database.DB.
		Where(
			"id = ? AND tenant_id = ?",
			id,
			tenantID,
		).
		First(&workflow)

	if result.Error != nil {

		return c.Status(404).JSON(
			fiber.Map{
				"error": "workflow not found",
			},
		)
	}

	// =========================
	// GET VERSION
	// =========================

	var version models.WorkflowVersion

	versionResult := database.DB.
		Where(
			"id = ? AND workflow_id = ?",
			versionID,
			workflow.ID,
		).
		First(&version)

	if versionResult.Error != nil {

		return c.Status(404).JSON(
			fiber.Map{
				"error": "version not found",
			},
		)
	}

	// =========================
	// CREATE NEW VERSION SNAPSHOT
	// =========================

	var latest models.WorkflowVersion

	database.DB.
		Where(
			"workflow_id = ?",
			workflow.ID,
		).
		Order("version desc").
		First(&latest)

	newVersion := models.WorkflowVersion{
		WorkflowID: workflow.ID,
		Version:    latest.Version + 1,
		Name:       workflow.Name,
		Definition: workflow.Definition,
	}

	database.DB.Create(&newVersion)

	// =========================
	// ROLLBACK
	// =========================

	workflow.Name = version.Name
	workflow.Definition = version.Definition

	saveResult := database.DB.Save(&workflow)

	if saveResult.Error != nil {

		return c.Status(500).JSON(
			fiber.Map{
				"error": "failed to rollback workflow",
			},
		)
	}

	return c.JSON(
		fiber.Map{
			"message":  "workflow rolled back",
			"workflow": workflow,
		},
	)
}
