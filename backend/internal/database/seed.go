package database

import (
	"fmt"

	"flowforge/internal/models"

	"golang.org/x/crypto/bcrypt"
)

func Seed() {

	var count int64

	DB.Model(&models.User{}).
		Count(&count)

	if count > 0 {

		fmt.Println(
			"SEED ALREADY EXISTS",
		)

		return
	}

	// =========================
	// CREATE TENANT
	// =========================

	tenant := models.Tenant{
		Name: "FlowForge Demo Tenant",
	}

	DB.Create(&tenant)

	// =========================
	// HASH PASSWORD
	// =========================

	hashedPassword, err :=
		bcrypt.GenerateFromPassword(
			[]byte("admin123"),
			14,
		)

	if err != nil {

		fmt.Println(
			"FAILED HASH PASSWORD",
		)

		return
	}

	// =========================
	// CREATE ADMIN USER
	// =========================

	admin := models.User{
		Email:    "admin@test.com",
		Password: string(hashedPassword),
		Role:     "admin",
		TenantID: tenant.ID,
	}

	DB.Create(&admin)

	fmt.Println("=================================")
	fmt.Println("FLOWFORGE SEED CREATED")
	fmt.Println("TENANT:", tenant.Name)
	fmt.Println("EMAIL: admin@test.com")
	fmt.Println("PASSWORD: admin123")
	fmt.Println("=================================")
}
