package execution

import (
	"fmt"
	"sync"
	"time"

	"flowforge/internal/database"
	"flowforge/internal/models"
	"flowforge/internal/realtime"
)

func ExecuteWithRetry(node Node) error {

	var err error

	maxRetries := node.MaxRetries

	if maxRetries == 0 {
		maxRetries = 3
	}

	for attempt := 0; attempt <= maxRetries; attempt++ {

		err = ExecuteNode(node)

		if err == nil {
			return nil
		}

		backoff := time.Duration(1<<attempt) * time.Second

		fmt.Println(
			"Retrying:",
			node.ID,
			"in",
			backoff,
		)

		realtime.SendEvent(
			"RETRYING:" + node.ID,
		)

		time.Sleep(backoff)
	}

	return err
}

func ExecuteWorkflow(
	workflowID uint,
	def WorkflowDefinition,
) {

	// =========================
	// CREATE WORKFLOW RUN
	// =========================

	workflowRun := models.WorkflowRun{
		WorkflowID: workflowID,
		Status:     "RUNNING",
		StartedAt:  time.Now().Unix(),
	}

	database.DB.Create(&workflowRun)

	// =========================
	// DAG STRUCTURE
	// =========================

	graph := make(map[string][]string)

	inDegree := make(map[string]int)

	nodes := make(map[string]Node)

	// =========================
	// BUILD NODES
	// =========================

	for _, node := range def.Nodes {

		nodes[node.ID] = node

		inDegree[node.ID] = 0
	}

	// =========================
	// BUILD EDGES
	// =========================

	for _, edge := range def.Edges {

		graph[edge.From] = append(
			graph[edge.From],
			edge.To,
		)

		inDegree[edge.To]++
	}

	// =========================
	// INITIAL QUEUE
	// =========================

	queue := []string{}

	for nodeID, degree := range inDegree {

		if degree == 0 {
			queue = append(queue, nodeID)
		}
	}

	workflowFailed := false

	// =========================
	// EXECUTE DAG
	// =========================

	for len(queue) > 0 {

		currentBatch := queue

		queue = []string{}

		var wg sync.WaitGroup

		// =========================
		// PARALLEL EXECUTION
		// =========================

		for _, nodeID := range currentBatch {

			wg.Add(1)

			go func(id string) {

				defer wg.Done()

				node := nodes[id]

				// =========================
				// REALTIME START EVENT
				// =========================

				realtime.SendEvent(
					"STARTED:" + node.ID,
				)

				// =========================
				// CREATE STEP RUN
				// =========================

				stepRun := models.StepRun{
					WorkflowRunID: workflowRun.ID,
					NodeID:        node.ID,
					Status:        "RUNNING",
					Logs:          "",
				}

				database.DB.Create(&stepRun)

				// =========================
				// EXECUTE NODE
				// =========================

				err := ExecuteWithRetry(node)

				if err != nil {

					fmt.Println(
						"Node permanently failed:",
						node.ID,
					)

					// =========================
					// FAILED EVENT
					// =========================

					realtime.SendEvent(
						"FAILED:" + node.ID,
					)

					stepRun.Status = "FAILED"

					stepRun.Logs = err.Error()

					database.DB.Save(&stepRun)

					workflowFailed = true

					return
				}

				// =========================
				// SUCCESS
				// =========================

				stepRun.Status = "SUCCESS"

				stepRun.Logs = "node executed successfully"

				database.DB.Save(&stepRun)

				realtime.SendEvent(
					"SUCCESS:" + node.ID,
				)

			}(nodeID)
		}

		// =========================
		// WAIT BATCH COMPLETE
		// =========================

		wg.Wait()

		// =========================
		// UPDATE DEPENDENCIES
		// =========================

		for _, nodeID := range currentBatch {

			for _, neighbor := range graph[nodeID] {

				inDegree[neighbor]--

				if inDegree[neighbor] == 0 {

					queue = append(
						queue,
						neighbor,
					)
				}
			}
		}
	}

	// =========================
	// FINAL STATUS
	// =========================

	if workflowFailed {
		workflowRun.Status = "FAILED"
	} else {
		workflowRun.Status = "SUCCESS"
	}

	workflowRun.EndedAt = time.Now().Unix()

	database.DB.Save(&workflowRun)

	fmt.Println("Workflow execution completed")

	realtime.SendEvent(
		"WORKFLOW_COMPLETED",
	)
}
