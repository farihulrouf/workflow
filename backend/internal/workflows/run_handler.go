package workflows

import (
	"flowforge/internal/database"
	"flowforge/internal/models"
	"flowforge/internal/queue"

	"github.com/gofiber/fiber/v2"
	jwt "github.com/golang-jwt/jwt/v4"
)

func RunWorkflow(c *fiber.Ctx) error {

	id := c.Params("id")

	var workflow models.Workflow

	user := c.Locals("user").(*jwt.Token)

	claims := user.Claims.(jwt.MapClaims)

	tenantID := uint(claims["tenant_id"].(float64))

	result := database.DB.
		Where("id = ? AND tenant_id = ?", id, tenantID).
		First(&workflow)

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

	user := c.Locals("user").(*jwt.Token)

	claims := user.Claims.(jwt.MapClaims)

	tenantID := uint(claims["tenant_id"].(float64))

	// =========================
	// QUERY PARAMS
	// =========================

	page := c.QueryInt("page", 1)
	limit := c.QueryInt("limit", 10)
	status := c.Query("status")

	offset := (page - 1) * limit

	// =========================
	// QUERY
	// =========================

	var runs []models.WorkflowRun

	query := database.DB.
		Joins("JOIN workflows ON workflows.id = workflow_runs.workflow_id").
		Where("workflows.tenant_id = ?", tenantID)

	if status != "" {
		query = query.Where(
			"workflow_runs.status = ?",
			status,
		)
	}

	result := query.
		Order("workflow_runs.id desc").
		Limit(limit).
		Offset(offset).
		Find(&runs)

	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "failed to fetch workflow runs",
		})
	}

	// =========================
	// TOTAL COUNT
	// =========================

	var total int64

	countQuery := database.DB.
		Model(&models.WorkflowRun{}).
		Joins("JOIN workflows ON workflows.id = workflow_runs.workflow_id").
		Where("workflows.tenant_id = ?", tenantID)

	if status != "" {
		countQuery = countQuery.Where(
			"workflow_runs.status = ?",
			status,
		)
	}

	countQuery.Count(&total)

	// =========================
	// RESPONSE
	// =========================

	return c.JSON(fiber.Map{
		"data": runs,
		"meta": fiber.Map{
			"page":  page,
			"limit": limit,
			"total": total,
		},
	})
}

func GetWorkflowRun(c *fiber.Ctx) error {

	id := c.Params("id")

	user := c.Locals("user").(*jwt.Token)

	claims := user.Claims.(jwt.MapClaims)

	tenantID := uint(claims["tenant_id"].(float64))

	var run models.WorkflowRun

	result := database.DB.
		Joins("JOIN workflows ON workflows.id = workflow_runs.workflow_id").
		Where(
			"workflow_runs.id = ? AND workflows.tenant_id = ?",
			id,
			tenantID,
		).
		First(&run)

	if result.Error != nil {
		return c.Status(404).JSON(fiber.Map{
			"error": "run not found",
		})
	}

	var steps []models.StepRun

	database.DB.
		Where("workflow_run_id = ?", run.ID).
		Find(&steps)

	return c.JSON(fiber.Map{
		"run":   run,
		"steps": steps,
	})
}
