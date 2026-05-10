package auth

type RegisterRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	Tenant   string `json:"tenant"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}
