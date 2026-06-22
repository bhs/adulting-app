package handlers

import (
	"net/http"
	"strconv"

	"github.com/example/go-echo-htmx/internal/db"
	"github.com/example/go-echo-htmx/internal/models"
	"github.com/labstack/echo/v4"
)

// ListUsers returns all users
func (h *Handler) ListUsers(c echo.Context) error {
	users, err := h.queries.ListUsers(c.Request().Context())
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to fetch users")
	}

	// Check if this is an HTMX request
	if c.Request().Header.Get("HX-Request") == "true" {
		return c.Render(http.StatusOK, "users-list.html", map[string]interface{}{
			"Users": users,
		})
	}

	return c.Render(http.StatusOK, "users.html", map[string]interface{}{
		"Title": "Users",
		"Users": users,
	})
}

// CreateUser creates a new user
func (h *Handler) CreateUser(c echo.Context) error {
	var req models.CreateUserRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid request")
	}

	if err := c.Validate(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	user, err := h.queries.CreateUser(c.Request().Context(), db.CreateUserParams{
		Email: req.Email,
		Name:  req.Name,
	})
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to create user")
	}

	// For HTMX requests, return just the new user row
	if c.Request().Header.Get("HX-Request") == "true" {
		return c.Render(http.StatusOK, "user-row.html", map[string]interface{}{
			"User": user,
		})
	}

	return c.JSON(http.StatusCreated, user)
}

// GetUser returns a single user
func (h *Handler) GetUser(c echo.Context) error {
	id, err := strconv.ParseInt(c.Param("id"), 10, 32)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid user ID")
	}

	user, err := h.queries.GetUser(c.Request().Context(), int32(id))
	if err != nil {
		return echo.NewHTTPError(http.StatusNotFound, "User not found")
	}

	return c.JSON(http.StatusOK, user)
}

// UpdateUser updates a user
func (h *Handler) UpdateUser(c echo.Context) error {
	id, err := strconv.ParseInt(c.Param("id"), 10, 32)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid user ID")
	}

	var req models.UpdateUserRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid request")
	}

	if err := c.Validate(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	user, err := h.queries.UpdateUser(c.Request().Context(), db.UpdateUserParams{
		ID:    int32(id),
		Name:  req.Name,
		Email: req.Email,
	})
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to update user")
	}

	// For HTMX requests, return the updated user row
	if c.Request().Header.Get("HX-Request") == "true" {
		return c.Render(http.StatusOK, "user-row.html", map[string]interface{}{
			"User": user,
		})
	}

	return c.JSON(http.StatusOK, user)
}

// DeleteUser deletes a user
func (h *Handler) DeleteUser(c echo.Context) error {
	id, err := strconv.ParseInt(c.Param("id"), 10, 32)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid user ID")
	}

	if err := h.queries.DeleteUser(c.Request().Context(), int32(id)); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to delete user")
	}

	// For HTMX requests, return empty response (row will be swapped out)
	if c.Request().Header.Get("HX-Request") == "true" {
		return c.NoContent(http.StatusOK)
	}

	return c.NoContent(http.StatusNoContent)
}
