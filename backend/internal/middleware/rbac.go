package middleware

import (
	"github.com/gofiber/fiber/v2"
	jwt "github.com/golang-jwt/jwt/v4"
)

func RequireRoles(roles ...string) fiber.Handler {

	return func(c *fiber.Ctx) error {

		user := c.Locals("user").(*jwt.Token)

		claims := user.Claims.(jwt.MapClaims)

		role := claims["role"].(string)

		for _, allowedRole := range roles {

			if role == allowedRole {
				return c.Next()
			}
		}

		return c.Status(403).JSON(fiber.Map{
			"error": "forbidden",
		})
	}
}
