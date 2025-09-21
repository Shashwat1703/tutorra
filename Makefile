.PHONY: help up down build logs fmt test seed demo

help:
	@echo "Targets:"
	@echo "  up     - docker compose up (detached)"
	@echo "  down   - docker compose down"
	@echo "  build  - docker compose build"
	@echo "  logs   - docker compose logs -f"
	@echo "  fmt    - format api and web"
	@echo "  test   - run api/runner tests (placeholder)"
	@echo "  seed   - seed demo data (placeholder)"
	@echo "  demo   - run e2e demo script (placeholder)"

up:
	docker compose up -d

down:
	docker compose down

build:
	docker compose build

logs:
	docker compose logs -f

fmt:
	@echo "Formatting API (placeholder)..."
	@echo "Formatting Web (placeholder)..."

test:
	@echo "Running tests (placeholder)..."

seed:
	@echo "Seeding demo data (placeholder)..."

demo:
	@echo "Running E2E demo (placeholder)..."
