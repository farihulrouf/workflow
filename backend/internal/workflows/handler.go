package workflows

import (
	"encoding/json"

	"flowforge/internal/database"
	"flowforge/internal/execution"
	"flowforge/internal/models"

	"github.com/gofiber/fiber/v2"
	jwt "github.com/golang-jwt/jwt/v4"
)

func CreateWorkflow(c *fiber.Ctx) error {

	var body CreateWorkflowRequest

	// =========================
	// PARSE REQUEST BODY
	// =========================

	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "invalid request body",
		})
	}

	// =========================
	// GET USER JWT
	// =========================

	user := c.Locals("user").(*jwt.Token)

	claims := user.Claims.(jwt.MapClaims)

	tenantID := uint(claims["tenant_id"].(float64))

	// =========================
	// PARSE WORKFLOW DEFINITION
	// =========================

	definitionBytes, err := json.Marshal(body.Definition)

	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "failed to parse workflow definition",
		})
	}

	var definition execution.WorkflowDefinition

	err = json.Unmarshal(
		definitionBytes,
		&definition,
	)

	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "invalid workflow definition",
		})
	}

	// =========================
	// VALIDATE DAG CYCLE
	// =========================

	if execution.HasCycle(definition) {
		return c.Status(400).JSON(fiber.Map{
			"error": "workflow contains cycle",
		})
	}

	// =========================
	// TOPOLOGICAL SORT
	// =========================

	order, err := execution.TopologicalSort(definition)

	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "failed to sort workflow",
		})
	}

	// =========================
	// CREATE WORKFLOW
	// =========================

	workflow := models.Workflow{
		Name:       body.Name,
		Definition: definitionBytes,
		TenantID:   tenantID,
	}

	result := database.DB.Create(&workflow)

	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "failed to create workflow",
		})
	}

	// =========================
	// RESPONSE
	// =========================

	return c.JSON(fiber.Map{
		"workflow":        workflow,
		"execution_order": order,
	})
}
