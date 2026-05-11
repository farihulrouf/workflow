package main

import (
	"encoding/json"
	"fmt"
	"log"

	"flowforge/internal/database"
	"flowforge/internal/execution"
	"flowforge/internal/models"
	"flowforge/internal/queue"
	"flowforge/internal/realtime"

	"github.com/joho/godotenv"
)

func main() {

	// =========================
	// LOAD ENV
	// =========================

	err := godotenv.Load()

	if err != nil {
		log.Fatal("Error loading .env")
	}

	// =========================
	// CONNECT DATABASE
	// =========================

	database.ConnectDB()

	// =========================
	// INIT REDIS
	// =========================

	realtime.InitRedis()

	fmt.Println("Worker started...")

	for {

		result, err := queue.Redis.BRPop(
			queue.Ctx,
			0,
			"workflow_jobs",
		).Result()

		if err != nil {
			fmt.Println(err)
			continue
		}

		var job queue.WorkflowJob

		err = json.Unmarshal(
			[]byte(result[1]),
			&job,
		)

		if err != nil {
			fmt.Println(err)
			continue
		}

		var workflow models.Workflow

		err = database.DB.First(
			&workflow,
			job.WorkflowID,
		).Error

		if err != nil {
			fmt.Println(err)
			continue
		}

		var definition execution.WorkflowDefinition

		err = json.Unmarshal(
			workflow.Definition,
			&definition,
		)

		if err != nil {
			fmt.Println(err)
			continue
		}

		fmt.Println(
			"Executing workflow:",
			workflow.ID,
		)

		execution.ExecuteWorkflow(
			workflow.ID,
			definition,
		)
	}
}
