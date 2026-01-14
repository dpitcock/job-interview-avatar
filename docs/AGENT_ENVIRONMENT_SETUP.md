# Agent Environment & Shell Setup

This document explains the discrepancies between the Agent's restricted shell environment and the User's interactive terminal, and provides instructions for Agents on how to handle Node.js version management.

## The Issue

The Agent operates in a restricted, non-interactive shell environment. This means:
1.  **No User Profile**: Configuration files like `.zshrc`, `.bash_profile`, or `.nvm/default-packages` are not automatically loaded.
2.  **System Default Node**: The shell uses the system's default Node.js version (often an LTS release like v20.x), which may differ from the project's required version (e.g., v24.x defined in `.node-version` or `package.json`).
3.  **Missing Aliases/Functions**: Tools like `nvm` (Node Version Manager) are shell functions, not binaries, so they are not available by default.

## How to Load the Correct Environment

To execute commands that require a specific Node.js version (managed by NVM) within the Agent's shell, you must explicitly source the NVM script and select the version in a **single command chain**.

### Command Pattern

```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"  # This loads nvm
nvm use                                          # This reads .nvmrc or .node-version
# OR
nvm use 24                                       # Explicit version

# Then run your command
npm run your-script
```

### Example: Running the Sync Script

```bash
export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" && nvm use 24 && npm run sync:users
```

## Why direct execution might fail

- Running `npm run ...` directly often fails if `npm` checks the `package.json` "engines" field and sees the Agent's mismatched system Node version.
- Running `node ...` directly uses the wrong version.

## Verification

If you need to verify the environment, run:

```bash
export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" && nvm current
```
