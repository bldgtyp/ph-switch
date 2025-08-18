# Development Scripts Guide

This document explains the available npm scripts for the PH-Switch project.

## Development Scripts

### Core Development

- `npm start` or `npm run dev` - Start the development server
- `npm run build` - Create production build
- `npm test` - Run tests in watch mode
- `npm run serve` - Serve production build locally

### Code Quality & Testing

- `npm run lint` - Check code for linting issues
- `npm run lint:fix` - Fix auto-fixable linting issues
- `npm run format` - Format all code with Prettier
- `npm run format:check` - Check if code is properly formatted
- `npm run typecheck` - Run TypeScript type checking
- `npm run test:ci` - Run tests with coverage (for CI)
- `npm run test:coverage` - Generate test coverage report
- `npm run validate` - Run all checks (typecheck + lint + format + test)

### Utility Scripts

- `npm run clean` - Clean build cache and node_modules cache
- `npm run analyze` - Build and serve for bundle analysis

## Recommended Workflow

### Before Committing

```bash
npm run validate
```

This runs type checking, linting, formatting checks, and tests with coverage.

### Development

```bash
npm start              # Start development server
npm test               # Run tests (in separate terminal)
```

### Pre-deployment

```bash
npm run build          # Create production build
npm run serve          # Test production build locally
```

## CI/CD Integration

For continuous integration, use:

```bash
npm run validate       # Complete validation pipeline
```

This ensures all code quality checks pass before deployment.

## Performance Notes

- Bundle size target: < 100kB (currently ~59kB gzipped)
- Test coverage target: > 80%
- Build time target: < 30 seconds
