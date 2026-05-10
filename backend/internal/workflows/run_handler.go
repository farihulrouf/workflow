package workflows

import (
	"encoding/json"

	"flowforge/internal/database"
	"flowforge/internal/execution"
	"flowforge/internal/models"

	"github.com/gofiber/fiber/v2"
)

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

	go execution.ExecuteWorkflow(definition)

	return c.JSON(fiber.Map{
		"message": "workflow execution started",
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

	result := database.DB.First(&run, id)

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
