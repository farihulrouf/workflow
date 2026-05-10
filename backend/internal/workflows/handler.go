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

	// Parse workflow definition
	definitionBytes, err := json.Marshal(body.Definition)

	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "failed to parse workflow definition",
		})
	}

	var definition execution.WorkflowDefinition

	err = json.Unmarshal(definitionBytes, &definition)

	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "invalid workflow definition",
		})
	}

	// Validate DAG cycle
	if execution.HasCycle(definition) {
		return c.Status(400).JSON(fiber.Map{
			"error": "workflow contains cycle",
		})
	}

	// Topological Sort
	order, err := execution.TopologicalSort(definition)

	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "failed to sort workflow",
		})
	}

	// Create workflow model
	workflow := models.Workflow{
		Name:       body.Name,
		Definition: definitionBytes,
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
	return c.JSON(fiber.Map{
		"workflow":        workflow,
		"execution_order": order,
	})
}

func RunWorkflow(c *fiber.Ctx) error {
	id := c.Params("id")

	var workflow models.Workflow

	result := database.DB.First(&workflow, id)

	if result.Error != nil {
		return c.Status(404).JSON(fiber.Map{
			"error": "workflow not found",
		})
	}

	var definition execution.WorkflowDefinition

	err := json.Unmarshal(
		workflow.Definition,
		&definition,
	)

	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "failed to parse workflow",
		})
	}

	// Execute workflow in background
	go execution.ExecuteWorkflow(definition)

	return c.JSON(fiber.Map{
		"message": "workflow execution started",
	})
}
