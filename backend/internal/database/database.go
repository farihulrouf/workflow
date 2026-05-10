package database

import (
	"fmt"
	"log"
	"os"

	"flowforge/internal/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDB() {
	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
		os.Getenv("DB_PORT"),
	)

	database, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})

	if err != nil {
		log.Fatal("Failed to connect database")
	}

	database.AutoMigrate(
		&models.Tenant{},
		&models.User{},
		&models.Workflow{},
		&models.WorkflowRun{},
		&models.StepRun{},
	)

	DB = database

	log.Println("Database connected")
}
