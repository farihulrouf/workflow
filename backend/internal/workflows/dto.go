package workflows

type CreateWorkflowRequest struct {
	Name       string `json:"name"`
	Definition any    `json:"definition"`
}
