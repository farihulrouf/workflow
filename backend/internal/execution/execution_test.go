package execution

import "testing"

// =========================
// TEST VALID DAG
// =========================

func TestHasCycle_ValidDAG(t *testing.T) {

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

func TestHasCycle_InvalidDAG(t *testing.T) {

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

func TestTopologicalSort(t *testing.T) {

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
		t.Errorf("expected no error, got %v", err)
	}

	if len(order) != 4 {
		t.Errorf("expected 4 nodes, got %d", len(order))
	}
}
