package queue

import (
	"encoding/json"
	"fmt"

	"flowforge/internal/database"
	"flowforge/internal/execution"
	"flowforge/internal/models"
)

func StartWorker() {

	go func() {

		for job := range JobQueue {

			fmt.Println(
				"Processing workflow:",
				job.WorkflowID,
			)

			// =========================
			// GET WORKFLOW
			// =========================

			var workflow models.Workflow

			result := database.DB.First(
				&workflow,
				job.WorkflowID,
			)

			if result.Error != nil {

				fmt.Println(
					"Workflow not found",
				)

				continue
			}

			// =========================
			// PARSE DEFINITION
			// =========================

			var definition execution.WorkflowDefinition

			err := json.Unmarshal(
				workflow.Definition,
				&definition,
			)

			if err != nil {

				fmt.Println(
					"Failed parse workflow",
				)

				continue
			}

			// =========================
			// EXECUTE WORKFLOW
			// =========================

			execution.ExecuteWorkflow(
				workflow.ID,
				definition,
			)

			fmt.Println(
				"Workflow completed",
			)
		}
	}()
}
