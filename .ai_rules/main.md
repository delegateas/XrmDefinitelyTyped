---
description: Main entry point for AI-based development and developer reference
globs:
alwaysApply: true
---

# Main Entry Point

This is the main entry point for AI-based development when working with this codebase, but also serves as a great reference for developers.

Always follow these rule files very carefully, as they have been crafted to ensure consistency and high-quality code.

## High-Level Problem Solving Strategy

1. Understand the problem deeply. Carefully read the instructions and think critically about what is required.
2. Investigate the codebase. Explore relevant files, search for key functions, and gather context.
3. Develop a clear, step-by-step plan. Break down the fix into manageable, incremental steps.
4. Before each code change, always consult the relevant rule files, and follow the rules very carefully. All rule files are located in the .ai_rules folder.
   - Failure to follow the rules is the main reason for making unacceptable changes.
5. Iterate until you are extremely confident the fix is complete.
   - When changing code, do not add comments about what you changed.
6. After each change, make sure you follow the rules in [Backend Rules](.ai_rules/backend/backend.md) or [Frontend Rules](.ai_rules/frontend/frontend.md) on how to correctly build and test.
    - Failure to correctly build and test is the second most common reason for making unacceptable changes.

## Rules for implementing changes

Always consult the relevant rule files before each code change.

Please note that I often correct or even revert code you generated. If you notice that, take special care not to revert my changes.

## Testing Requirements

- Never perform manual or visual testing through browsers
- Always write automated tests

Be very careful with comments, and add them only very sparingly. Never add comments about changes made (these belong in pull requests).

When making changes, always take special care not to change parts of the code that are not in scope.
