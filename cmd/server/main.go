package main

import (
	"fmt"
	"html/template"
	"io"
	"log"
	"os"

	"github.com/example/go-echo-htmx/internal/db"
	"github.com/example/go-echo-htmx/internal/handlers"
	"github.com/example/go-echo-htmx/internal/middleware"
	"github.com/example/go-echo-htmx/internal/web"
	"github.com/go-playground/validator/v10"
	"github.com/joho/godotenv"
	"github.com/labstack/echo/v4"
	echomiddleware "github.com/labstack/echo/v4/middleware"
)

// CustomValidator wraps the validator
type CustomValidator struct {
	validator *validator.Validate
}

// Validate validates the struct
func (cv *CustomValidator) Validate(i interface{}) error {
	if err := cv.validator.Struct(i); err != nil {
		return echo.NewHTTPError(400, err.Error())
	}
	return nil
}

// TemplateRenderer is a custom html/template renderer for Echo framework
type TemplateRenderer struct {
	templates *template.Template
}

// Render renders a template document
func (t *TemplateRenderer) Render(w io.Writer, name string, data interface{}, c echo.Context) error {
	return t.templates.ExecuteTemplate(w, name, data)
}

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	// Get configuration from environment
	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		log.Fatal("DATABASE_URL environment variable is required")
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Connect to database
	database, err := db.Connect(databaseURL)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer database.Close()

	// Run migrations
	migrationsPath := "./migrations"
	if err := db.RunMigrations(database, migrationsPath); err != nil {
		log.Fatalf("Failed to run migrations: %v", err)
	}
	log.Println("Database migrations completed successfully")

	// Initialize Echo
	e := echo.New()
	e.HideBanner = true

	// Set up validator
	e.Validator = &CustomValidator{validator: validator.New()}

	// Set up template renderer
	tmpl := template.Must(template.ParseFS(web.Templates, "templates/*.html"))
	e.Renderer = &TemplateRenderer{
		templates: tmpl,
	}

	// Middleware
	e.Use(middleware.Logger())
	e.Use(middleware.CORS())
	e.Use(echomiddleware.Recover())

	// Serve static files
	e.StaticFS("/static", echo.MustSubFS(web.Static, "static"))

	// Initialize handlers
	h := handlers.New(database)

	// Routes
	e.GET("/", h.Home)
	e.GET("/users", h.ListUsers)

	// API routes
	api := e.Group("/api")
	{
		api.POST("/users", h.CreateUser)
		api.GET("/users/:id", h.GetUser)
		api.PUT("/users/:id", h.UpdateUser)
		api.DELETE("/users/:id", h.DeleteUser)
	}

	// Start server
	log.Printf("Server starting on port %s", port)
	if err := e.Start(fmt.Sprintf(":%s", port)); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
