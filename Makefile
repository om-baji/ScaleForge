install:
	cd inventory-svc && pnpm install && cd ../orders-svc && pnpm install

run-inventory:
	cd inventory-svc && pnpm start

run-order:
	cd inventory-svc && pnpm start

start:
	cd inventory-svc && pnpm start && cd ../orders-svc && pnpm start
