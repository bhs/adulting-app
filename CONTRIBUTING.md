# Contributing to Go Echo HTMX

Thank you for your interest in contributing to this project!

## Development Setup

1. Fork and clone the repository
2. Install Go 1.22 or higher
3. Install dependencies: `go mod download`
4. Install development tools: `make install-tools`
5. Start PostgreSQL: `docker-compose up -d postgres`
6. Run the application: `make run`

## Code Guidelines

- Follow standard Go conventions and idioms
- Run `go fmt` before committing
- Ensure all tests pass: `make test`
- Run linters: `make check`
- Add tests for new features
- Update documentation as needed

## Database Changes

When adding new database features:

1. Create a new migration file in `migrations/`
2. Update SQL queries in `internal/db/queries/`
3. Regenerate sqlc code: `make sqlc`
4. Test migrations with both up and down

## Submitting Changes

1. Create a feature branch from `main`
2. Make your changes with clear commit messages
3. Ensure all tests and linters pass
4. Push to your fork
5. Submit a pull request

## Code of Conduct

Be respectful, inclusive, and professional in all interactions.
