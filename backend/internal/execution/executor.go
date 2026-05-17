package execution

import (
	"encoding/json"
	"fmt"
	"sync"
	"time"

	"flowforge/internal/database"
	"flowforge/internal/models"
	"flowforge/internal/realtime"
)

func sendRealtimeEvent(
	workflowRunID uint,
	step string,
	status string,
	message string,
) {

	event := map[string]interface{}{
		"workflow_run_id": workflowRunID,
		"step":            step,
		"status":          status,
		"message":         message,
		"timestamp":       time.Now().Unix(),
	}

	eventJSON, _ := json.Marshal(event)

	realtime.SendEvent(string(eventJSON))
}

func ExecuteWithRetry(
	workflowRunID uint,
	node Node,
) error {

	var err error

	maxRetries := node.MaxRetries

	if maxRetries == 0 {
		maxRetries = 3
	}

	for attempt := 0; attempt <= maxRetries; attempt++ {

		err = ExecuteNode(node)

		if err == nil {
			fmt.Println(
				"NODE EXECUTED SUCCESSFULLY:",
				node.ID,
			)
			return nil
		}

		backoff := time.Duration(1<<attempt) * time.Second

		fmt.Println(
			"RETRY NODE:",
			node.ID,
			"WAIT:",
			backoff,
		)

		go sendRealtimeEvent(
			workflowRunID,
			node.ID,
			"retrying",
			fmt.Sprintf(
				"retrying in %v",
				backoff,
			),
		)

		time.Sleep(backoff)
	}

	return err
}

func ExecuteWorkflow(
	workflowID uint,
	def WorkflowDefinition,
) {

	// =====================================
	// CREATE WORKFLOW RUN
	// =====================================
	startTime := time.Now()
	workflowRun := models.WorkflowRun{
		WorkflowID: workflowID,
		Status:     "RUNNING",
		StartedAt:  time.Now().Unix(),
	}

	result := database.DB.Create(&workflowRun)

	if result.Error != nil {

		fmt.Println("FAILED CREATE WORKFLOW RUN")
		fmt.Println(result.Error)

		return
	}

	fmt.Println("==========")
	fmt.Println("WORKFLOW RUN CREATED")
	fmt.Println("RUN ID:", workflowRun.ID)
	fmt.Println("TOTAL NODES:", len(def.Nodes))
	fmt.Println("TOTAL EDGES:", len(def.Edges))
	fmt.Println("==========")

	// =====================================
	// DAG STRUCTURE
	// =====================================

	graph := make(map[string][]string)

	inDegree := make(map[string]int)

	nodes := make(map[string]Node)

	// =====================================
	// BUILD NODES
	// =====================================

	fmt.Println("BUILDING NODES")

	for _, node := range def.Nodes {

		fmt.Println(
			"NODE:",
			node.ID,
			node.Type,
		)

		nodes[node.ID] = node

		inDegree[node.ID] = 0
	}

	// =====================================
	// BUILD EDGES
	// =====================================

	fmt.Println("BUILDING EDGES")

	for _, edge := range def.Edges {

		fmt.Println(
			"EDGE:",
			edge.From,
			"->",
			edge.To,
		)

		graph[edge.From] = append(
			graph[edge.From],
			edge.To,
		)

		inDegree[edge.To]++
	}

	// =====================================
	// INITIAL QUEUE
	// =====================================

	queue := []string{}

	for nodeID, degree := range inDegree {

		if degree == 0 {

			fmt.Println(
				"QUEUE NODE:",
				nodeID,
			)

			queue = append(queue, nodeID)
		}
	}

	workflowFailed := false

	var mu sync.Mutex

	// =====================================
	// EXECUTE DAG
	// =====================================

	for len(queue) > 0 {

		currentBatch := queue
		fmt.Println("================================")
		fmt.Println("NEW EXECUTION BATCH")
		fmt.Println("CURRENT QUEUE:", queue)
		fmt.Println("================================")
		queue = []string{}

		var wg sync.WaitGroup

		// =====================================
		// EXECUTE BATCH
		// =====================================

		for _, nodeID := range currentBatch {

			wg.Add(1)

			go func(id string) {
				fmt.Println("GOROUTINE STARTED:", id)
				defer wg.Done()

				node := nodes[id]

				fmt.Println(
					"START EXECUTE NODE:",
					node.ID,
				)
				fmt.Println("NODE DETAIL")
				fmt.Println("ID:", node.ID)
				fmt.Println("TYPE:", node.Type)
				fmt.Println("MAX RETRIES:", node.MaxRetries)

				// =====================================
				// REALTIME EVENT
				// =====================================

				go sendRealtimeEvent(
					workflowRun.ID,
					node.ID,
					"running",
					"node started",
				)

				// =====================================
				// CREATE STEP RUN
				// =====================================

				stepRun := models.StepRun{
					WorkflowRunID: workflowRun.ID,
					NodeID:        node.ID,
					Status:        "RUNNING",
					Logs:          "",
				}

				result := database.DB.Create(&stepRun)

				if result.Error != nil {

					fmt.Println("STEP RUN CREATE ERROR")
					fmt.Println(result.Error)

					mu.Lock()
					workflowFailed = true
					mu.Unlock()

					return
				}

				fmt.Println(
					"STEP RUN CREATED:",
					stepRun.ID,
				)

				// =====================================
				// EXECUTE NODE
				// =====================================

				err := ExecuteWithRetry(
					workflowRun.ID,
					node,
				)

				if err != nil {

					fmt.Println(
						"NODE FAILED:",
						node.ID,
					)

					fmt.Println(err)

					go sendRealtimeEvent(
						workflowRun.ID,
						node.ID,
						"failed",
						err.Error(),
					)

					stepRun.Status = "FAILED"

					stepRun.Logs = err.Error()

					saveResult := database.DB.Save(&stepRun)

					if saveResult.Error != nil {

						fmt.Println(
							"SAVE FAILED STEP ERROR:",
						)

						fmt.Println(
							saveResult.Error,
						)
					}

					mu.Lock()
					workflowFailed = true
					mu.Unlock()

					return
				}

				// =====================================
				// SUCCESS
				// =====================================

				stepRun.Status = "SUCCESS"

				stepRun.Logs =
					"node executed successfully"

				saveResult := database.DB.Save(&stepRun)

				if saveResult.Error != nil {

					fmt.Println(
						"SAVE SUCCESS STEP ERROR:",
					)

					fmt.Println(
						saveResult.Error,
					)
				}

				go sendRealtimeEvent(
					workflowRun.ID,
					node.ID,
					"success",
					"node executed successfully",
				)

				fmt.Println(
					"NODE SUCCESS:",
					node.ID,
				)

			}(nodeID)
		}

		// =====================================
		// WAIT BATCH
		// =====================================

		wg.Wait()

		fmt.Println("BATCH COMPLETED")

		// =====================================
		// UPDATE NEXT NODES
		// =====================================

		for _, nodeID := range currentBatch {

			for _, neighbor := range graph[nodeID] {

				inDegree[neighbor]--

				fmt.Println(
					"DECREASE INDEGREE:",
					neighbor,
					"=",
					inDegree[neighbor],
				)

				if inDegree[neighbor] == 0 {

					fmt.Println(
						"NEXT QUEUE:",
						neighbor,
					)

					queue = append(
						queue,
						neighbor,
					)
				}
			}
		}
	}

	// =====================================
	// FINAL STATUS
	// =====================================

	if workflowFailed {

		workflowRun.Status = "FAILED"

	} else {

		workflowRun.Status = "SUCCESS"
	}

	workflowRun.EndedAt = time.Now().Unix()

	saveWorkflow := database.DB.Save(&workflowRun)

	if saveWorkflow.Error != nil {

		fmt.Println(
			"FAILED SAVE WORKFLOW RUN",
		)

		fmt.Println(
			saveWorkflow.Error,
		)
	}

	fmt.Println("==========")
	fmt.Println("WORKFLOW FINISHED")
	fmt.Println("FINAL STATUS:", workflowRun.Status)
	fmt.Println("TOTAL DURATION:", time.Since(startTime))
	fmt.Println("==========")

	go sendRealtimeEvent(
		workflowRun.ID,
		"",
		"completed",
		"workflow execution completed",
	)
}
