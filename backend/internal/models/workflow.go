package models

import (
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type Workflow struct {
	gorm.Model

	Name           string         `json:"name"`
	Definition     datatypes.JSON `json:"definition"`
	CronExpression string         `json:"cron_expression"`

	TenantID uint `json:"tenant_id"`
}
