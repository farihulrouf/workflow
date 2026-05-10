package models

import "gorm.io/gorm"

type Tenant struct {
	gorm.Model
	Name string
}
