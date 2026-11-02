# Repository Guidelines

## Project Structure & Module Organization

This repository is currently an empty project scaffold. No source code, tests, assets, or build configuration exist yet. When introducing the initial implementation, group application code in `src/`, automated tests in `tests/`, and static resources in `assets/` where the chosen framework permits. Keep related modules together and document any framework-specific layout in the pull request.

## Build, Test, and Development Commands

No development, build, lint, or test commands are configured. When adding the toolchain, provide reproducible commands through its standard configuration, such as package scripts or a Makefile. Document the exact setup, local run, build, and test commands alongside that change. Do not assume commands such as `npm test` work until the corresponding configuration exists.

## Coding Style & Naming Conventions

Follow the conventions of the language and framework selected for the project. Use consistent indentation, descriptive names, and small modules with clear responsibilities. Prefer composition over inheritance. Add formatter and linter configuration with the initial implementation so contributors can apply the same rules automatically. Avoid unrelated refactoring and dependencies without a concrete need.

## Testing Guidelines

No testing framework or coverage threshold is established. Add behavior-focused tests with new functionality and regression tests for bug fixes. Use unit tests for domain rules and integration tests for system boundaries. Test names should describe the expected result and triggering condition. Include the exact test command and result in each pull request.

## Commit & Pull Request Guidelines

There is no Git history available to infer existing conventions. Use English Conventional Commits, for example `feat: add initial game loop` or `fix: handle invalid input`. Keep commits focused on one logical change. Pull requests should explain the problem, resulting behavior, and validation performed; link relevant issues and include screenshots for visible changes.

## Security & Configuration

Never commit secrets or credentials. Supply sensitive configuration through environment variables and validate external input.
