@echo off
echo Starting Neon Setup...

echo 1. Installing neon CLI and logging in...
call npm i -g neon@latest
call neon login

echo 2. Installing Neon skills...
call neon skills -y
call npx neon@latest skills -s neon -s neon-postgres -y

echo 3. Setting up Neon MCP...
call neon mcp -y

echo 4. Linking project...
call neon link --project-id still-bread-74409690 --branch production -y

echo 5. Initializing Neon config...
call neon config init

echo Setup complete! You can now update neon.ts as required.
pause
