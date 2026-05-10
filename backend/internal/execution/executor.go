package execution

import (
	"fmt"
	"sync"
)

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

	for len(queue) > 0 {
		currentBatch := queue
		queue = []string{}

		var wg sync.WaitGroup

		// Execute parallel batch
		for _, nodeID := range currentBatch {
			wg.Add(1)

			go func(id string) {
				defer wg.Done()

				node := nodes[id]

				ExecuteNode(node)
			}(nodeID)
		}

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
