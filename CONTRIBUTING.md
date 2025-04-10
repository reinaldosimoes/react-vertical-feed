# Contributing to React Vertical Feed

Thank you for your interest in contributing to React Vertical Feed! This document provides guidelines and steps for contributing to this project.

## Code of Conduct

By participating in this project, you agree to abide by the [Code of Conduct](CODE_OF_CONDUCT.md).

## How to Contribute

1. Fork the repository
2. Create a new branch for your feature/fix
3. Make your changes
4. Run tests and ensure they pass
5. Submit a pull request

## Development Setup

1. Clone your fork:

   ```bash
   git clone https://github.com/your-username/react-vertical-feed.git
   cd react-vertical-feed
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

## Testing

- Run tests: `npm test`
- Run tests in watch mode: `npm run test:watch`
- Run tests with coverage: `npm run test:coverage`

## Code Style

- Use TypeScript for all new code
- Follow the existing code style
- Run linter before committing: `npm run lint`
- Format code before committing: `npm run format`

## Pull Request Guidelines

- Keep PRs focused and small
- Include tests for new features
- Update documentation if needed
- Follow the commit message convention
- Ensure all tests pass
- Check bundle size impact

## Commit Message Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `style:` for code style changes
- `refactor:` for code refactoring
- `test:` for test changes
- `chore:` for maintenance tasks

Example:

```
feat: add support for custom video controls
```

## Release Process

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create a new release on GitHub
4. Publish to npm

## Questions?

Feel free to open an issue if you have any questions about contributing!
