# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Run Commands
- Build: `npm run build`
- Start: `npm run start`
- Development mode: `npm run dev`
- Type checking: `npm run typecheck`

## Code Standards
- TypeScript with strict type checking enabled
- Use ES2023 as target
- Follow CommonJS module format
- Use async/await for asynchronous operations
- Error handling: Use try/catch blocks and proper error logging

## Naming Conventions
- Use camelCase for variables and functions
- Use PascalCase for classes and interfaces
- Use kebab-case for file names

## Imports and Structure
- Order imports: external libraries first, then local files
- Group related functionality in dedicated files
- Export only what's necessary

## Project Information
- MCP server implementation using TypeScript
- Requires gcloud CLI and appropriate IAM permissions
- Uses @modelcontextprotocol/sdk for MCP server implementation
- Node.js version >=18 required