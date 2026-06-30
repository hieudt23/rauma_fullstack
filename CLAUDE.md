# Project Guidelines

## Core Development Commands
- Build: `npm run build` or appropriate build commands
- Dev/Run: `npm run dev`
- Test: `npm test`

## Serena MCP Integration & Automation Rules
This project strictly integrates the Serena MCP Server (installed via GitHub `oraios/serena`) as the core Semantic Analysis Engine. 

### ALWAYS-ON INSTRUCTIONS FOR THE AI AGENT:
1. **Automatic Initialization**: At the very beginning of EVERY session, or before executing any development task, you MUST automatically invoke the Serena MCP onboarding/initialization tool to read the project's initial instructions and load the codebase index. Do not wait for explicit user confirmation to trigger Serena.
2. **Context Optimization**: Prioritize using Serena's semantic tools (e.g., symbolic code structure lookup, context-aware navigation) over raw text commands (`grep`, `cat`, or default `list_dir`) to efficiently analyze the workspace and preserve token context.
3. **Task Lifecycle**: Whenever a significant code change or refactoring is performed, run Serena's index refresh/analysis tools to keep the semantic mapping up to date.
