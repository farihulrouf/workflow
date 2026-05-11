package queue

import "encoding/json"

type WorkflowJob struct {
	WorkflowID uint `json:"workflow_id"`
	RunID      uint `json:"run_id"`
}

func Enqueue(job WorkflowJob) error {

	jobJSON, err := json.Marshal(job)

	if err != nil {
		return err
	}

	return Redis.LPush(
		Ctx,
		"workflow_jobs",
		jobJSON,
	).Err()
}
