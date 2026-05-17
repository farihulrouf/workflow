package models

import "gorm.io/gorm"

type User struct {
	gorm.Model
	Email    string `gorm:"unique"`
	Name     string // <--- tambahkan ini
	Password string
	Role     string `gorm:"default:viewer"`

	TenantID uint
	Tenant   Tenant
}
