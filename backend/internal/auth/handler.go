package auth

import (
	"flowforge/internal/database"
	"flowforge/internal/models"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
)

func Register(c *fiber.Ctx) error {
	var body RegisterRequest

	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "invalid body",
		})
	}

	hashedPassword, _ := bcrypt.GenerateFromPassword(
		[]byte(body.Password),
		14,
	)

	tenant := models.Tenant{
		Name: body.Tenant,
	}

	database.DB.Create(&tenant)

	user := models.User{
		Email:    body.Email,
		Password: string(hashedPassword),
		Role:     "admin",
		TenantID: tenant.ID,
	}

	database.DB.Create(&user)

	return c.JSON(fiber.Map{
		"message": "registered",
	})
}
