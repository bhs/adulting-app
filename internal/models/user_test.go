package models

import (
	"testing"
)

func TestCreateUserRequest(t *testing.T) {
	req := CreateUserRequest{
		Email: "test@example.com",
		Name:  "Test User",
	}

	if req.Email != "test@example.com" {
		t.Errorf("Expected email to be test@example.com, got %s", req.Email)
	}

	if req.Name != "Test User" {
		t.Errorf("Expected name to be Test User, got %s", req.Name)
	}
}

func TestUpdateUserRequest(t *testing.T) {
	req := UpdateUserRequest{
		Email: "updated@example.com",
		Name:  "Updated User",
	}

	if req.Email != "updated@example.com" {
		t.Errorf("Expected email to be updated@example.com, got %s", req.Email)
	}

	if req.Name != "Updated User" {
		t.Errorf("Expected name to be Updated User, got %s", req.Name)
	}
}
