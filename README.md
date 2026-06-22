# Go Echo HTMX Application

A modern, full-stack web application built with Go, Echo framework, HTMX, and PostgreSQL. This project demonstrates a clean architecture with type-safe database queries using sqlc and interactive frontend capabilities with HTMX.

## Features

- **Go Echo v4**: High-performance web framework with middleware support
- **HTMX**: Modern hypermedia-driven interactivity without heavy JavaScript
- **Tailwind CSS**: Utility-first CSS framework (via CDN)
- **PostgreSQL**: Robust relational database
- **sqlc**: Type-safe, compile-time-checked SQL queries
- **golang-migrate**: Database schema migrations
- **Docker**: Containerized development and deployment
- **GitHub Actions**: Automated CI/CD pipeline

## Project Structure

```
.
├── cmd/
│   └── server/           # Application entrypoint
│       └── main.go
├── internal/
│   ├── db/              # Database layer (sqlc generated code)
│   │   ├── queries/     # SQL queries for sqlc
│   │   └── db.go        # Database connection and migrations
│   ├── handlers/        # HTTP request handlers
│   ├── middleware/      # Custom middleware
│   └── models/          # Domain models
├── migrations/          # Database migrations
├── web/
│   ├── static/         # Static assets
│   └── templates/      # HTML templates
├── .github/
│   └── workflows/      # GitHub Actions CI/CD
├── Dockerfile
├── docker-compose.yml
└── sqlc.yaml           # sqlc configuration
```

## Prerequisites

- Go 1.22 or higher
- Docker and Docker Compose
- PostgreSQL (if running locally without Docker)
- sqlc (for regenerating queries): `go install github.com/sqlc-dev/sqlc/cmd/sqlc@latest`
- golang-migrate (optional, for manual migrations): `go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest`

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd go-echo-htmx
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```
DATABASE_URL=postgres://postgres:postgres@localhost:5432/appdb?sslmode=disable
PORT=8080
ENV=development
```

### 3. Run with Docker Compose (Recommended)

```bash
docker-compose up -d
```

The application will be available at `http://localhost:8080`

### 4. Run locally (Alternative)

Start PostgreSQL:
```bash
docker-compose up -d postgres
```

Install dependencies:
```bash
go mod download
```

Run the application:
```bash
go run cmd/server/main.go
```

## Development

### Install dependencies

```bash
go mod download
```

### Generate sqlc code

After modifying SQL queries in `internal/db/queries/`:

```bash
sqlc generate
```

### Run tests

```bash
go test ./...
```

### Run with coverage

```bash
go test -v -race -coverprofile=coverage.out -covermode=atomic ./...
go tool cover -html=coverage.out
```

### Linting

```bash
go vet ./...
staticcheck ./...
```

### Database migrations

Migrations run automatically on application startup. To create a new migration:

```bash
migrate create -ext sql -dir migrations -seq <migration_name>
```

## API Endpoints

### Web Routes
- `GET /` - Home page
- `GET /users` - Users list page

### API Routes
- `POST /api/users` - Create a new user
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## Deployment

### Railway

1. Install Railway CLI:
```bash
npm install -g @railway/cli
```

2. Login and initialize:
```bash
railway login
railway init
```

3. Add PostgreSQL:
```bash
railway add postgresql
```

4. Deploy:
```bash
railway up
```

5. Set environment variables in Railway dashboard:
```
DATABASE_URL=${{Postgres.DATABASE_URL}}
PORT=8080
ENV=production
```

### Fly.io

1. Install Fly CLI:
```bash
curl -L https://fly.io/install.sh | sh
```

2. Login and launch:
```bash
fly auth login
fly launch
```

3. Create PostgreSQL:
```bash
fly postgres create
fly postgres attach <postgres-app-name>
```

4. Deploy:
```bash
fly deploy
```

## Technology Stack

- **Backend**: Go 1.22+
- **Framework**: Echo v4
- **Database**: PostgreSQL 16
- **Query Builder**: sqlc
- **Migrations**: golang-migrate
- **Frontend**: HTMX 1.9.10, Tailwind CSS 3
- **Validation**: go-playground/validator
- **Environment**: godotenv

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details
