AI Signal Radar npm repair

1. Stop the current npm command with Ctrl+C.
2. Copy package-lock.json and .npmrc into the project root, replacing package-lock.json.
3. Delete any partial node_modules folder.
4. Run: npm ci --no-audit --no-fund
