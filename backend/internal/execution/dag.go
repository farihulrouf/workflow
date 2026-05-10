package execution

func TopologicalSort(def WorkflowDefinition) ([]string, error) {
	inDegree := make(map[string]int)
	graph := make(map[string][]string)

	// Initialize nodes
	for _, node := range def.Nodes {
		inDegree[node.ID] = 0
	}

	// Build graph
	for _, edge := range def.Edges {
		graph[edge.From] = append(
			graph[edge.From],
			edge.To,
		)

		inDegree[edge.To]++
	}

	// Queue nodes with 0 indegree
	queue := []string{}

	for node, degree := range inDegree {
		if degree == 0 {
			queue = append(queue, node)
		}
	}

	result := []string{}

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

	return result, nil
}
