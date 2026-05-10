package workflows

import (
	"encoding/json"

	"flowforge/internal/database"
	"flowforge/internal/models"

	"github.com/gofiber/fiber/v2"
	jwt "github.com/golang-jwt/jwt/v4"
)

func CreateWorkflow(c *fiber.Ctx) error {
	var body CreateWorkflowRequest

	// Parse request body
	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "invalid request body",
		})
	}

	// Get JWT token from middleware
	user := c.Locals("user").(*jwt.Token)

	// Extract claims
	claims := user.Claims.(jwt.MapClaims)

	// Get tenant ID
	tenantID := uint(claims["tenant_id"].(float64))

	// Convert workflow definition to JSON
	definitionJSON, err := json.Marshal(body.Definition)

	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "failed to parse workflow definition",
		})
	}

	// Create workflow model
	workflow := models.Workflow{
		Name:       body.Name,
		Definition: definitionJSON,
		TenantID:   tenantID,
	}

	// Save to database
	result := database.DB.Create(&workflow)

	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "failed to create workflow",
		})
	}

	// Return response
	return c.JSON(workflow)
}
