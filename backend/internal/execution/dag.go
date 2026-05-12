package execution

import "fmt"

func TopologicalSort(def WorkflowDefinition) ([]string, error) {

	inDegree := make(map[string]int)
	graph := make(map[string][]string)

	// =========================
	// VALIDATE NODES
	// =========================

	nodeSet := make(map[string]bool)

	for _, node := range def.Nodes {
		inDegree[node.ID] = 0
		nodeSet[node.ID] = true
	}

	// =========================
	// BUILD GRAPH + VALIDATE
	// =========================

	for _, edge := range def.Edges {

		// Validate source node
		if !nodeSet[edge.From] {
			return nil, fmt.Errorf(
				"invalid edge source node: %s",
				edge.From,
			)
		}

		// Validate target node
		if !nodeSet[edge.To] {
			return nil, fmt.Errorf(
				"invalid edge target node: %s",
				edge.To,
			)
		}

		graph[edge.From] = append(
			graph[edge.From],
			edge.To,
		)

		inDegree[edge.To]++
	}

	// =========================
	// QUEUE ROOT NODES
	// =========================

	queue := []string{}

	for node, degree := range inDegree {
		if degree == 0 {
			queue = append(queue, node)
		}
	}

	result := []string{}

	// =========================
	// TOPOLOGICAL SORT
	// =========================

	for len(queue) > 0 {

		current := queue[0]
		queue = queue[1:]

		result = append(result, current)

		for _, neighbor := range graph[current] {

			inDegree[neighbor]--

			if inDegree[neighbor] == 0 {
				queue = append(queue, neighbor)
			}
		}
	}

	// =========================
	// CYCLE DETECTION
	// =========================

	if len(result) != len(def.Nodes) {
		return nil, fmt.Errorf(
			"cycle detected in workflow",
		)
	}

	return result, nil
}
