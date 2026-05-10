package models

import (
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type WorkflowVersion struct {
	gorm.Model

	WorkflowID uint           `json:"workflow_id"`
	Version    int            `json:"version"`
	Name       string         `json:"name"`
	Definition datatypes.JSON `json:"definition"`
}
