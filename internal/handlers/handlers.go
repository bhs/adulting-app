package handlers

import (
	"database/sql"

	"github.com/example/go-echo-htmx/internal/db"
)

// Handler holds dependencies for all handlers
type Handler struct {
	queries *db.Queries
}

// New creates a new Handler instance
func New(database *sql.DB) *Handler {
	return &Handler{
		queries: db.New(database),
	}
}
