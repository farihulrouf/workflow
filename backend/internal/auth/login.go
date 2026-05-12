package auth

import (
	"os"
	"time"

	"flowforge/internal/database"
	"flowforge/internal/models"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

func Login(c *fiber.Ctx) error {

	var body LoginRequest

	if err := c.BodyParser(&body); err != nil {

		return c.Status(400).JSON(fiber.Map{
			"error": "invalid body",
		})
	}

	var user models.User

	result := database.DB.
		Where("email = ?", body.Email).
		First(&user)

	if result.Error != nil {

		return c.Status(401).JSON(fiber.Map{
			"error": "invalid credentials",
		})
	}

	err := bcrypt.CompareHashAndPassword(
		[]byte(user.Password),
		[]byte(body.Password),
	)

	if err != nil {

		return c.Status(401).JSON(fiber.Map{
			"error": "invalid credentials",
		})
	}

	claims := jwt.MapClaims{
		"user_id":   user.ID,
		"tenant_id": user.TenantID,
		"email":     user.Email,
		"role":      user.Role,
		"exp": time.Now().
			Add(time.Hour * 24).
			Unix(),
	}

	token := jwt.NewWithClaims(
		jwt.SigningMethodHS256,
		claims,
	)

	t, err := token.SignedString(
		[]byte(os.Getenv("JWT_SECRET")),
	)

	if err != nil {

		return c.Status(500).JSON(fiber.Map{
			"error": "failed to generate token",
		})
	}

	return c.JSON(fiber.Map{
		"token": t,
	})
}
