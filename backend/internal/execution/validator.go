package execution

type Node struct {
	ID   string `json:"id"`
	Type string `json:"type"`
}

type Edge struct {
	From string `json:"from"`
	To   string `json:"to"`
}

type WorkflowDefinition struct {
	Nodes []Node `json:"nodes"`
	Edges []Edge `json:"edges"`
}

func HasCycle(def WorkflowDefinition) bool {
	graph := make(map[string][]string)

	for _, edge := range def.Edges {
		graph[edge.From] = append(
			graph[edge.From],
			edge.To,
		)
	}

	visited := make(map[string]bool)
	recStack := make(map[string]bool)

	var dfs func(string) bool

	dfs = func(node string) bool {
		if recStack[node] {
			return true
		}

		if visited[node] {
			return false
		}

		visited[node] = true
		recStack[node] = true

		for _, neighbor := range graph[node] {
			if dfs(neighbor) {
				return true
			}
		}

		recStack[node] = false

		return false
	}

	for _, node := range def.Nodes {
		if dfs(node.ID) {
			return true
		}
	}

	return false
}
