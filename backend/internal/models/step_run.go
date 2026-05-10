package models

import "gorm.io/gorm"

type StepRun struct {
	gorm.Model

	WorkflowRunID uint

	NodeID string

	Status string

	Logs string
}
