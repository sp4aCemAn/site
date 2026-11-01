.PHONY: run, down

run: 
	docker compose up

down: 
	docker compose down -v 
