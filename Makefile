.PHONY: help build run test clean docker-up docker-down sqlc migrate-up migrate-down

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

build: ## Build the application
	@echo "Building application..."
	@go build -o bin/server cmd/server/main.go

run: ## Run the application
	@echo "Running application..."
	@go run cmd/server/main.go

test: ## Run tests
	@echo "Running tests..."
	@go test -v -race -coverprofile=coverage.out -covermode=atomic ./...

coverage: test ## Generate coverage report
	@go tool cover -html=coverage.out

vet: ## Run go vet
	@echo "Running go vet..."
	@go vet ./...

lint: ## Run staticcheck
	@echo "Running staticcheck..."
	@staticcheck ./...

check: vet lint test ## Run all checks

clean: ## Clean build artifacts
	@echo "Cleaning..."
	@rm -rf bin/
	@rm -f coverage.out

docker-up: ## Start Docker containers
	@echo "Starting Docker containers..."
	@docker-compose up -d

docker-down: ## Stop Docker containers
	@echo "Stopping Docker containers..."
	@docker-compose down

docker-logs: ## Show Docker logs
	@docker-compose logs -f

sqlc: ## Generate sqlc code
	@echo "Generating sqlc code..."
	@sqlc generate

deps: ## Download dependencies
	@echo "Downloading dependencies..."
	@go mod download

tidy: ## Tidy go.mod
	@echo "Tidying go.mod..."
	@go mod tidy

install-tools: ## Install development tools
	@echo "Installing tools..."
	@go install github.com/sqlc-dev/sqlc/cmd/sqlc@latest
	@go install honnef.co/go/tools/cmd/staticcheck@latest
	@go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest

.DEFAULT_GOAL := help
