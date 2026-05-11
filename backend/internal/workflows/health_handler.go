package workflows

import (
	"time"

	"flowforge/internal/database"
	"flowforge/internal/models"

	"github.com/gofiber/fiber/v2"
)

func GetHealthMetrics(c *fiber.Ctx) error {

	var activeRuns int64

	database.DB.
		Model(&models.WorkflowRun{}).
		Where("status = ?", "RUNNING").
		Count(&activeRuns)

	var successRuns int64

	database.DB.
		Model(&models.WorkflowRun{}).
		Where("status = ?", "SUCCESS").
		Count(&successRuns)

	var failedRuns int64

	database.DB.
		Model(&models.WorkflowRun{}).
		Where("status = ?", "FAILED").
		Count(&failedRuns)

	var runs []models.WorkflowRun

	last24h := time.Now().
		Add(-24 * time.Hour).
		Unix()

	database.DB.
		Where("started_at >= ?", last24h).
		Find(&runs)

	var totalDuration int64

	for _, run := range runs {

		duration :=
			run.EndedAt - run.StartedAt

		totalDuration += duration
	}

	avgDuration := int64(0)

	if len(runs) > 0 {

		avgDuration =
			totalDuration / int64(len(runs))
	}

	return c.JSON(
		fiber.Map{
			"active_runs":              activeRuns,
			"success_runs":             successRuns,
			"failed_runs":              failedRuns,
			"average_duration_seconds": avgDuration,
		},
	)
}
