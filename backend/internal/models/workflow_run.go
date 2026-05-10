package models

import "gorm.io/gorm"

type WorkflowRun struct {
	gorm.Model

	WorkflowID uint

	Status string

	StartedAt int64
	EndedAt   int64
}
