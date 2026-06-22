package models

import "time"

// User represents a user in the system
type User struct {
	ID        int32     `json:"id"`
	Email     string    `json:"email"`
	Name      string    `json:"name"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// CreateUserRequest represents the request body for creating a user
type CreateUserRequest struct {
	Email string `json:"email" form:"email" validate:"required,email"`
	Name  string `json:"name" form:"name" validate:"required,min=2"`
}

// UpdateUserRequest represents the request body for updating a user
type UpdateUserRequest struct {
	Email string `json:"email" form:"email" validate:"required,email"`
	Name  string `json:"name" form:"name" validate:"required,min=2"`
}
