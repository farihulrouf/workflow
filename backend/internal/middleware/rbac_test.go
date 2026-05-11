package middleware

import (
	"net/http/httptest"
	"testing"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v4"
)

func TestRequireRoles(t *testing.T) {

	app := fiber.New()

	app.Use(func(c *fiber.Ctx) error {

		token := &jwt.Token{
			Claims: jwt.MapClaims{
				"role": "viewer",
			},
		}

		c.Locals("user", token)

		return c.Next()
	})

	app.Get(
		"/test",
		RequireRoles("admin", "editor"),
		func(c *fiber.Ctx) error {
			return c.SendStatus(200)
		},
	)

	req := httptest.NewRequest(
		"GET",
		"/test",
		nil,
	)

	resp, err := app.Test(req)

	if err != nil {
		t.Fatal(err)
	}

	if resp.StatusCode != 403 {
		t.Errorf(
			"expected 403, got %d",
			resp.StatusCode,
		)
	}
}
