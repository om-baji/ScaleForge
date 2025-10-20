echo -n "Setting up database..."

cd packages/db

bunx prisma generate

bun install

cd ../..

bun install

echo -n "Setup Complete!"
