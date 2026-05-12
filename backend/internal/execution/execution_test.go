package execution

import "testing"

// =========================
// TEST VALID DAG
// =========================

func TestHasCycle_WithoutCycle(t *testing.T) {

	definition := WorkflowDefinition{
		Nodes: []Node{
			{ID: "A"},
			{ID: "B"},
			{ID: "C"},
		},
		Edges: []Edge{
			{From: "A", To: "B"},
			{From: "B", To: "C"},
		},
	}

	hasCycle := HasCycle(definition)

	if hasCycle {
		t.Errorf("expected no cycle, got cycle")
	}
}

// =========================
// TEST CYCLIC DAG
// =========================

func TestHasCycle_WithCycle(t *testing.T) {

	definition := WorkflowDefinition{
		Nodes: []Node{
			{ID: "A"},
			{ID: "B"},
			{ID: "C"},
		},
		Edges: []Edge{
			{From: "A", To: "B"},
			{From: "B", To: "C"},
			{From: "C", To: "A"},
		},
	}

	hasCycle := HasCycle(definition)

	if !hasCycle {
		t.Errorf("expected cycle, got no cycle")
	}
}

// =========================
// TEST TOPOLOGICAL SORT
// =========================

func TestTopologicalSort_ValidDAG(t *testing.T) {

	definition := WorkflowDefinition{
		Nodes: []Node{
			{ID: "A"},
			{ID: "B"},
			{ID: "C"},
			{ID: "D"},
		},
		Edges: []Edge{
			{From: "A", To: "B"},
			{From: "A", To: "C"},
			{From: "B", To: "D"},
			{From: "C", To: "D"},
		},
	}

	order, err := TopologicalSort(definition)

	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if len(order) != 4 {
		t.Fatalf("expected 4 nodes, got %d", len(order))
	}

	index := map[string]int{}

	for i, node := range order {
		index[node] = i
	}

	if index["A"] > index["B"] {
		t.Errorf("expected A before B")
	}

	if index["A"] > index["C"] {
		t.Errorf("expected A before C")
	}

	if index["B"] > index["D"] {
		t.Errorf("expected B before D")
	}

	if index["C"] > index["D"] {
		t.Errorf("expected C before D")
	}
}

// =========================
// TEST EMPTY DAG
// =========================

func TestTopologicalSort_EmptyWorkflow(t *testing.T) {

	definition := WorkflowDefinition{
		Nodes: []Node{},
		Edges: []Edge{},
	}

	order, err := TopologicalSort(definition)

	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if len(order) != 0 {
		t.Fatalf("expected empty result, got %d nodes", len(order))
	}
}

// =========================
// TEST INVALID EDGE
// =========================

func TestTopologicalSort_InvalidEdge(t *testing.T) {

	definition := WorkflowDefinition{
		Nodes: []Node{
			{ID: "A"},
			{ID: "B"},
		},
		Edges: []Edge{
			{From: "A", To: "Z"},
		},
	}

	_, err := TopologicalSort(definition)

	if err == nil {
		t.Fatalf("expected error for invalid edge, got nil")
	}
}

// =========================
// TEST EXECUTE WITH RETRY
// =========================

func TestExecuteWithRetry_Success(t *testing.T) {

	node := Node{
		ID:   "TEST_NODE",
		Type: "start",
	}

	err := ExecuteWithRetry(1, node)

	if err != nil {
		t.Fatalf(
			"expected success, got error: %v",
			err,
		)
	}
}
