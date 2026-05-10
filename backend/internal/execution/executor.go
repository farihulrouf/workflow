package execution

import (
	"fmt"
	"sync"
	"time"
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

		time.Sleep(backoff)
	}

	return err
}

func ExecuteWorkflow(def WorkflowDefinition) {
	graph := make(map[string][]string)
	inDegree := make(map[string]int)
	nodes := make(map[string]Node)

	// Build graph
	for _, node := range def.Nodes {
		nodes[node.ID] = node
		inDegree[node.ID] = 0
	}

	for _, edge := range def.Edges {
		graph[edge.From] = append(
			graph[edge.From],
			edge.To,
		)

		inDegree[edge.To]++
	}

	// Initial queue
	queue := []string{}

	for nodeID, degree := range inDegree {
		if degree == 0 {
			queue = append(queue, nodeID)
		}
	}

	// Execute DAG
	for len(queue) > 0 {
		currentBatch := queue
		queue = []string{}

		var wg sync.WaitGroup

		// Execute nodes in parallel
		for _, nodeID := range currentBatch {
			wg.Add(1)

			go func(id string) {
				defer wg.Done()

				node := nodes[id]

				err := ExecuteWithRetry(node)

				if err != nil {
					fmt.Println(
						"Node permanently failed:",
						node.ID,
					)
				}
			}(nodeID)
		}

		// Wait batch complete
		wg.Wait()

		// Update dependencies
		for _, nodeID := range currentBatch {
			for _, neighbor := range graph[nodeID] {
				inDegree[neighbor]--

				if inDegree[neighbor] == 0 {
					queue = append(queue, neighbor)
				}
			}
		}
	}

	fmt.Println("Workflow execution completed")
}
