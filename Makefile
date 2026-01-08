.PHONY: all stop test

all:
	npm install
	npm run client-dist
	npm run srv-dist
	DEBUG=tetris:* node dist/server/main.js

stop:
	pkill -f "node dist/server/main.js"

test:
	npm run coverage