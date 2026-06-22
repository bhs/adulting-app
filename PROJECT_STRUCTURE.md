# Project Structure

This document provides an overview of the go-echo-htmx project structure.

## Directory Layout

```
go-echo-htmx/
├── cmd/
│   └── server/              # Application entrypoint
│       └── main.go          # Server initialization and routing
│
├── internal/
│   ├── db/                  # Database layer
│   │   ├── connection.go    # Database connection and migrations
│   │   ├── db.go            # sqlc generated: base types
│   │   ├── models.go        # sqlc generated: models
│   │   ├── querier.go       # sqlc generated: interface
│   │   ├── users.sql.go     # sqlc generated: user queries
│   │   └── queries/
│   │       └── users.sql    # SQL queries for sqlc
│   │
│   ├── handlers/            # HTTP request handlers
│   │   ├── handlers.go      # Handler initialization
│   │   ├── home.go          # Home page handler
│   │   ├── users.go         # User CRUD handlers
│   │   └── handlers_test.go # Handler tests
│   │
│   ├── middleware/          # Custom middleware
│   │   ├── cors.go          # CORS middleware
│   │   └── logger.go        # Logging middleware
│   │
│   ├── models/              # Domain models
│   │   ├── user.go          # User model and request types
│   │   └── user_test.go     # Model tests
│   │
│   └── web/                 # Web assets (embedded)
│       ├── embed.go         # Embed directives for templates/static
│       ├── static/
│       │   └── style.css    # Custom CSS (optional)
│       └── templates/
│           ├── index.html   # Home page template
│           ├── users.html   # Users list page
│           ├── user-row.html # User table row partial
│           └── users-list.html # Users list partial
│
├── migrations/              # Database migrations
│   ├── 000001_create_users_table.up.sql
│   └── 000001_create_users_table.down.sql
│
├── .github/
│   └── workflows/
│       └── ci.yml           # GitHub Actions CI/CD
│
├── .env.example             # Environment variables template
├── .env                     # Local environment (gitignored)
├── .gitignore              # Git ignore rules
├── .dockerignore           # Docker ignore rules
├── docker-compose.yml      # Docker Compose configuration
├── Dockerfile              # Multi-stage Docker build
├── Makefile                # Build and development commands
├── sqlc.yaml               # sqlc configuration
├── go.mod                  # Go module definition
├── go.sum                  # Go module checksums
├── README.md               # Project documentation
└── CONTRIBUTING.md         # Contribution guidelines
```

## Key Components

### cmd/server/main.go
- Application entrypoint
- Server configuration
- Route registration
- Template and static file setup
- Middleware initialization

### internal/db
- Database connection management
- Migration execution
- sqlc-generated type-safe queries
- SQL query definitions

### internal/handlers
- HTTP request handlers
- HTMX-aware responses
- Request validation
- Error handling

### internal/middleware
- CORS configuration
- Request logging
- Custom middleware components

### internal/models
- Domain models
- Request/response types
- Validation tags

### internal/web
- Embedded templates and static files
- HTMX + Tailwind CSS templates
- Reusable template partials

## Data Flow

1. **Request** → Echo Router
2. **Middleware** → Logger, CORS, Recovery
3. **Handler** → Validate request, call database
4. **Database** → sqlc queries (type-safe)
5. **Response** → Render template or JSON

## Development Workflow

1. Modify SQL queries in `internal/db/queries/`
2. Run `make sqlc` to regenerate code
3. Update handlers to use new queries
4. Add/modify templates in `internal/web/templates/`
5. Run `make run` to test locally
6. Run `make test` before committing
7. Push and let CI validate changes

## Database Workflow

1. Create migration: `migrate create -ext sql -dir migrations -seq <name>`
2. Write up/down migrations
3. Migrations auto-run on server start
4. Update queries in `internal/db/queries/`
5. Regenerate: `make sqlc`

## Deployment

- **Docker**: `docker-compose up` for local
- **Railway**: Connect repo, auto-deploy on push
- **Fly.io**: `fly launch` and `fly deploy`
- All use the same Dockerfile
