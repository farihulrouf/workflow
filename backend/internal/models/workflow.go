package models

import (
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type Workflow struct {
	gorm.Model
	Name       string
	Definition datatypes.JSON
	TenantID   uint
}
