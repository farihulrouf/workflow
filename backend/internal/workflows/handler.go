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
	// CREATE INITIAL VERSION
	// =========================

	version := models.WorkflowVersion{
		WorkflowID: workflow.ID,
		Version:    1,
		Name:       workflow.Name,
		Definition: workflow.Definition,
	}

	versionResult := database.DB.Create(&version)

	if versionResult.Error != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "failed to create workflow version",
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

// =========================
// GET ALL WORKFLOWS
// =========================

func GetWorkflows(c *fiber.Ctx) error {

	user := c.Locals("user").(*jwt.Token)

	claims := user.Claims.(jwt.MapClaims)

	tenantID := uint(claims["tenant_id"].(float64))

	// =========================
	// QUERY PARAMS
	// =========================

	page := c.QueryInt("page", 1)
	limit := c.QueryInt("limit", 10)
	search := c.Query("search")

	offset := (page - 1) * limit

	// =========================
	// QUERY
	// =========================

	var workflows []models.Workflow

	query := database.DB.
		Where("tenant_id = ?", tenantID)

	if search != "" {
		query = query.Where(
			"name ILIKE ?",
			"%"+search+"%",
		)
	}

	result := query.
		Order("id desc").
		Limit(limit).
		Offset(offset).
		Find(&workflows)

	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "failed to fetch workflows",
		})
	}

	// =========================
	// TOTAL COUNT
	// =========================

	var total int64

	countQuery := database.DB.
		Model(&models.Workflow{}).
		Where("tenant_id = ?", tenantID)

	if search != "" {
		countQuery = countQuery.Where(
			"name ILIKE ?",
			"%"+search+"%",
		)
	}

	countQuery.Count(&total)

	// =========================
	// RESPONSE
	// =========================

	return c.JSON(fiber.Map{
		"data": workflows,
		"meta": fiber.Map{
			"page":  page,
			"limit": limit,
			"total": total,
		},
	})
}

// =========================
// GET SINGLE WORKFLOW
// =========================

func GetWorkflow(c *fiber.Ctx) error {

	id := c.Params("id")

	user := c.Locals("user").(*jwt.Token)

	claims := user.Claims.(jwt.MapClaims)

	tenantID := uint(claims["tenant_id"].(float64))

	var workflow models.Workflow

	result := database.DB.
		Where("id = ? AND tenant_id = ?", id, tenantID).
		First(&workflow)

	if result.Error != nil {
		return c.Status(404).JSON(fiber.Map{
			"error": "workflow not found",
		})
	}

	return c.JSON(workflow)
}

// =========================
// UPDATE WORKFLOW
// =========================

func UpdateWorkflow(c *fiber.Ctx) error {

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

	var body CreateWorkflowRequest

	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "invalid request body",
		})
	}

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
	// GET LATEST VERSION
	// =========================

	var latestVersion models.WorkflowVersion

	database.DB.
		Where("workflow_id = ?", workflow.ID).
		Order("version desc").
		First(&latestVersion)

	newVersion := latestVersion.Version + 1

	// =========================
	// SAVE OLD WORKFLOW VERSION
	// =========================

	version := models.WorkflowVersion{
		WorkflowID: workflow.ID,
		Version:    newVersion,
		Name:       workflow.Name,
		Definition: workflow.Definition,
	}

	versionResult := database.DB.Create(&version)

	if versionResult.Error != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "failed to create workflow version",
		})
	}

	// =========================
	// UPDATE WORKFLOW
	// =========================

	workflow.Name = body.Name
	workflow.Definition = definitionBytes

	saveResult := database.DB.Save(&workflow)

	if saveResult.Error != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "failed to update workflow",
		})
	}

	return c.JSON(fiber.Map{
		"message":  "workflow updated",
		"workflow": workflow,
	})
}

// =========================
// DELETE WORKFLOW
// =========================

func DeleteWorkflow(c *fiber.Ctx) error {

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

	deleteResult := database.DB.Delete(&workflow)

	if deleteResult.Error != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "failed to delete workflow",
		})
	}

	return c.JSON(fiber.Map{
		"message": "workflow deleted",
	})
}
