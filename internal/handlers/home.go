package handlers

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

// Home renders the home page
func (h *Handler) Home(c echo.Context) error {
	return c.Render(http.StatusOK, "index.html", map[string]interface{}{
		"Title": "Go Echo HTMX",
	})
}
