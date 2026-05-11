package scheduler

import (
	"fmt"

	"flowforge/internal/database"
	"flowforge/internal/models"
	"flowforge/internal/queue"

	"github.com/robfig/cron/v3"
)

func StartScheduler() {

	c := cron.New()

	var workflows []models.Workflow

	database.DB.Find(&workflows)

	for _, workflow := range workflows {

		if workflow.CronExpression == "" {
			continue
		}

		w := workflow

		_, err := c.AddFunc(
			w.CronExpression,
			func() {

				fmt.Println(
					"RUNNING CRON WORKFLOW:",
					w.ID,
				)

				queue.Enqueue(
					queue.WorkflowJob{
						WorkflowID: w.ID,
					},
				)
			},
		)

		if err != nil {

			fmt.Println(
				"CRON ERROR:",
				err,
			)
		}
	}

	c.Start()

	fmt.Println("CRON SCHEDULER STARTED")
}
