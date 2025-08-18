# Task List: PH-Switch Unit Converter

Based on PRD: `prd-ph-unit-converter.md`

## Relevant Files

- `package.json` - Project dependencies and build configuration (add decimal.js, ajv for Phase 2)
- `public/index.html` - Main HTML template with proper meta tags and title
- `src/index.tsx` - React app entry point
- `src/App.tsx` - Main application component with layout structure
- `src/styles/App.css` - Global application styles and CSS variables
- `src/components/ConversionInput.tsx` - Multi-line text input component for natural language input
- `src/components/ConversionInput.test.tsx` - Unit tests for ConversionInput component
- `src/components/ConversionOutput.tsx` - Results display component with copy-to-clipboard functionality
- `src/components/ConversionOutput.test.tsx` - Unit tests for ConversionOutput component
- `src/components/ErrorMessage.tsx` - Error display component for parsing failures
- `src/components/ErrorMessage.test.tsx` - Unit tests for ErrorMessage component
- `src/utils/mockConverter.ts` - Mock conversion engine for UI testing (Phase 1 only - TO BE REPLACED)
- `src/utils/mockConverter.test.ts` - Unit tests for mock converter (TO BE REPLACED)
- `src/styles/variables.css` - CSS custom properties for consistent theming
- `src/styles/responsive.css` - Responsive design breakpoints and mobile styles

### Phase 2 Files (New Implementation)

- `src/config/schema.json` - JSON schema for unit configuration validation
- `src/config/length.json` - Length unit definitions with aliases and conversion factors
- `src/config/index.ts` - Central configuration management and exports
- `src/utils/configLoader.ts` - Utility to load and validate JSON unit configurations
- `src/utils/configLoader.test.ts` - Unit tests for configuration loader
- `src/utils/parser.ts` - Natural language parser for "X unit as/to Y unit" format
- `src/utils/parser.test.ts` - Unit tests for natural language parser
- `src/utils/converter.ts` - Real conversion engine replacing mockConverter
- `src/utils/converter.test.ts` - Unit tests for conversion engine
- `src/utils/storage.ts` - Local storage utilities for recent conversions
- `src/utils/storage.test.ts` - Unit tests for storage functionality
- `src/utils/errorHandler.ts` - Advanced error handling and unit suggestions
- `src/utils/errorHandler.test.ts` - Unit tests for error handling
- `src/types/index.ts` - TypeScript type definitions for units, conversions, and configurations

### Phase 3 Files (Future Enhancement)

- `src/components/AutoSuggest.tsx` - Dropdown component for unit discovery
- `src/components/AutoSuggest.test.tsx` - Unit tests for auto-suggest dropdown
- `src/config/thermal.json` - Thermal unit definitions for Passive House engineering
- `src/config/volume.json` - Volume and capacity unit definitions
- `src/config/density.json` - Density and mass unit definitions
- `src/utils/performance.ts` - Performance monitoring and optimization utilities
- `src/utils/performance.test.ts` - Unit tests for performance utilities
- `src/utils/cache.ts` - Caching utilities for conversion optimization
- `src/utils/cache.test.ts` - Unit tests for caching functionality
- `src/styles/animations.css` - CSS animations for enhanced user feedback
- `src/utils/accessibility.ts` - Accessibility enhancement utilities
- `src/utils/accessibility.test.ts` - Unit tests for accessibility features

### Notes

- Unit tests should be placed alongside the code files they are testing
- Use `npm test` to run the Jest test suite
- Focus on UI functionality first with mock data before implementing real conversion logic
- Prioritize desktop-first responsive design that scales down to mobile
- Follow Google Translate interface paradigm for layout and user experience

### Phase 2 Dependencies Required

Add these to package.json before starting Phase 2 implementation:

- `decimal.js` - High-precision arithmetic to avoid floating-point calculation errors
- `ajv` - JSON schema validation for configuration files
- `fast-levenshtein` or similar - String distance calculation for fuzzy unit matching
- Consider `lodash.memoize` - For caching/performance optimization (if not already available)

## Design and UI Guidelines

- `context/ui/google_translate.png` - Example of a simple side-by-side conversion application
- `context/ui/ui_mockup.png` - A simple wireframe of the desired app layout
- `context/ui/design-principles` - A checklist of good design principles to use when building front-end elements.

## Tasks

### Phase 1: UI Mockup (Focus on Interface First) **COMPLETE**

- [x] 1.0 Project Setup and Foundation
  - [x] 1.1 Initialize React application using Create React App with TypeScript template
  - [x] 1.2 Configure ESLint and Prettier for code formatting and quality
  - [x] 1.3 Set up project folder structure (components, utils, styles directories)
  - [x] 1.4 Install minimal dependencies (no external UI libraries - custom CSS only)
  - [x] 1.5 Configure package.json scripts for development and production builds

- [x] 2.0 Mock Conversion Engine (For UI Testing)
  - [x] 2.1 Create mockConverter.js with simple hardcoded conversion logic
  - [x] 2.2 Implement basic parsing for "X unit as/to Y unit" format
  - [x] 2.3 Add mock support for length units (meter, foot, inch, cm, mm, km, yard, mile)
  - [x] 2.4 Format mock results to 3 decimal places with comma thousands separators
  - [x] 2.5 Include mock error handling for invalid input patterns
  - [x] 2.6 Write unit tests for mock converter functionality

- [x] 3.0 React UI Components
  - [x] 3.1 Create ConversionInput component with multi-line textarea
  - [x] 3.2 Create ConversionOutput component with formatted results display
  - [x] 3.3 Create ErrorMessage component for parsing failure feedback
  - [x] 3.4 Implement click-to-copy functionality for conversion results
  - [x] 3.5 Add proper ARIA labels and accessibility attributes
  - [x] 3.6 Write unit tests for all UI components

- [x] 4.0 Google Translate-Style Interface Layout
  - [x] 4.1 Design main App component with side-by-side panel layout
  - [x] 4.2 Implement input panel (left) with multi-line textarea
  - [x] 4.3 Implement output panel (right) with results display
  - [x] 4.4 Add visual separation between input and output areas
  - [x] 4.5 Create header with application title and minimal branding
  - [x] 4.6 Ensure clean, professional appearance suitable for engineers

- [x] 5.0 Multi-line Input System
  - [x] 5.1 Implement line-by-line conversion processing
  - [x] 5.2 Add real-time conversion updates as user types (with debouncing)
  - [x] 5.3 Handle textarea auto-expansion for multiple lines
  - [x] 5.4 Maintain cursor position during real-time updates
  - [x] 5.5 Display individual results aligned with corresponding input lines
  - [x] 5.6 Test multi-line functionality with various input combinations

- [x] 6.0 Desktop-First Responsive Design
  - [x] 6.1 Create CSS custom properties for consistent theming
  - [x] 6.2 Implement desktop layout (1200px+ screens) as primary design
  - [x] 6.3 Add tablet responsiveness (768px - 1199px) with adjusted spacing
  - [x] 6.4 Implement mobile layout (below 768px) with stacked panels if needed
  - [x] 6.5 Ensure touch-friendly interaction targets for mobile devices
  - [x] 6.6 Test responsiveness across different screen sizes and orientations

- [x] 7.0 Basic Error Display and Visual Feedback
  - [x] 7.1 Implement visual indicators for successful conversions
  - [x] 7.2 Add error styling for invalid input lines
  - [x] 7.3 Create loading states for conversion processing
  - [x] 7.4 Add hover and focus states for interactive elements
  - [x] 7.5 Implement basic error messages for unparseable input
  - [x] 7.6 Test error scenarios and user feedback mechanisms

### Phase 2: Functional Implementation (Replace Mocks) **COMPLETE**

- [x] 8.0 JSON Configuration System (Foundation for Real Conversions)
  - [x] 8.1 Create JSON schema definition file (`src/config/schema.json`) with strict validation rules for unit categories, aliases, and conversion factors
  - [x] 8.2 Implement comprehensive length.json (`src/config/length.json`) with all length units from mockConverter plus additional engineering units (mil, thou, angstrom, nautical mile, etc.)
  - [x] 8.3 Build TypeScript configuration loader (`src/utils/configLoader.ts`) with async JSON imports and TypeScript type definitions
  - [x] 8.4 Add runtime schema validation using AJV library to ensure configuration file integrity
  - [x] 8.5 Create configuration index (`src/config/index.ts`) to centrally manage and export all unit category configurations
  - [x] 8.6 Write comprehensive unit tests for configuration loading, validation, and error handling

- [x] 9.0 Natural Language Parser (Replace Mock Parsing)
  - [x] 9.1 Build robust parser utility (`src/utils/parser.ts`) to extract numerical value, source unit, and target unit using regex patterns
  - [x] 9.2 Implement strict format validation supporting both "X unit as Y unit" and "X unit to Y unit" with comprehensive error messages
  - [x] 9.3 Create unit alias matching system that searches through JSON configuration aliases (case-insensitive, handles plurals/singulars)
  - [x] 9.4 Add support for scientific notation (1.5e3), fractions (1/2), and mixed numbers (1 1/2) in value parsing
  - [x] 9.5 Implement Levenshtein distance-based fuzzy matching for unit suggestions when exact matches fail
  - [x] 9.6 Write extensive unit tests covering edge cases: empty input, malformed numbers, unknown units, ambiguous units

- [x] 10.0 Core Conversion Engine (Replace mockConverter)
  - [x] 10.1 Build production conversion engine (`src/utils/converter.ts`) replacing mockConverter.ts with JSON-driven calculations
  - [x] 10.2 Implement base unit conversion approach: source → base unit → target unit using multiplication factors from JSON
  - [x] 10.3 Add high-precision decimal arithmetic using decimal.js library to handle floating-point precision issues
  - [x] 10.4 Create formatting utility to display results with exactly 3 decimal places and comma thousands separators (e.g., "1,234.567")
  - [x] 10.5 Optimize performance with memoization/caching to ensure sub-100ms conversion times
  - [x] 10.6 Write comprehensive unit tests for conversion accuracy, precision handling, and performance benchmarks

- [x] 11.0 Enhanced Error Handling and User Feedback (Replace Basic Errors)
  - [x] 11.1 Create error handler utility (`src/utils/errorHandler.ts`) with categorized error types: INVALID_FORMAT, UNKNOWN_UNIT, CALCULATION_ERROR
  - [x] 11.2 Implement "Did you mean..." suggestion algorithm using fuzzy string matching against all available unit aliases
  - [x] 11.3 Build user-friendly error message system with actionable guidance and examples of correct format
  - [x] 11.4 Add error context preservation to show which part of input caused the parsing failure
  - [x] 11.5 Create error logging mechanism for development debugging (console.warn) without user data collection
  - [x] 11.6 Write unit tests for all error scenarios and validate suggestion accuracy against known typos

- [x] 12.0 Local Storage Integration (Conversion History)
  - [x] 12.1 Build storage utility (`src/utils/storage.ts`) to save successful conversions in browser localStorage
  - [x] 12.2 Implement conversion history data structure with timestamp, input, output, and conversion metadata
  - [x] 12.3 Add storage quota management with automatic cleanup of oldest entries when approaching localStorage limits
  - [x] 12.4 Create serialization/deserialization utilities with JSON schema validation for stored data integrity
  - [x] 12.5 Build history management functions: clear all, clear specific entries, export history as JSON
  - [x] 12.6 Write unit tests for storage operations, quota handling, and data persistence across browser sessions

- [x] 13.0 App Integration and Mock Replacement
  - [x] 13.1 Replace mockConverter import in App.tsx with new converter utility and update import statements
  - [x] 13.2 Update App.tsx to use new parser and error handler, maintaining existing UI state management
  - [x] 13.3 Integrate local storage to automatically save successful conversions and handle storage errors gracefully
  - [x] 13.4 Add loading states for configuration loading and async operations during app initialization
  - [x] 13.5 Implement fallback mechanism if configuration files fail to load (show helpful error message)
  - [x] 13.6 Update existing App component tests to work with new conversion system and add integration tests

### Phase 3: Enhanced Features

- [ ] 14.0 Auto-suggest Dropdown for Unit Discovery
  - [ ] 14.1 Create dropdown component that appears as user types unit names
  - [ ] 14.2 Implement real-time unit matching based on partial input (e.g., "me" shows "meter")
  - [ ] 14.3 Add keyboard navigation support (arrow keys, enter to select, escape to close)
  - [ ] 14.4 Position dropdown dynamically under cursor/input position
  - [ ] 14.5 Implement click-to-complete functionality for suggested units
  - [ ] 14.6 Write unit tests for auto-suggest functionality and user interactions

- [ ] 15.0 Additional Unit Categories (Thermal, Volume, Density)
  - [ ] 15.1 Create thermal.json with Passive House thermal units (Btu/hr-ft², W/m², U-values, etc.)
  - [ ] 15.2 Create volume.json with volume/capacity units (liter, gallon, cubic meter, etc.)
  - [ ] 15.3 Create density.json with density/mass units (kg/m³, lb/ft³, etc.)
  - [ ] 15.4 Update configuration loader to handle multiple unit categories
  - [ ] 15.5 Extend parser to recognize and process new unit types
  - [ ] 15.6 Write comprehensive tests for new unit categories and conversions

- [ ] 16.0 Performance Optimizations
  - [ ] 16.1 Implement efficient caching for parsed conversions and unit lookups
  - [ ] 16.2 Optimize bundle size by analyzing and removing unused dependencies
  - [ ] 16.3 Add performance monitoring to ensure sub-100ms conversion times
  - [ ] 16.4 Implement code splitting for better initial load performance
  - [ ] 16.5 Optimize re-rendering with React.memo and useCallback where appropriate
  - [ ] 16.6 Create performance test suite to validate speed requirements

- [ ] 17.0 Enhanced Error Handling and User Feedback
  - [ ] 17.1 Improve error message specificity with contextual guidance
  - [ ] 17.2 Add visual animations for successful conversions and error states
  - [ ] 17.3 Implement progressive error disclosure (basic → detailed explanations)
  - [ ] 17.4 Add accessibility improvements for screen readers and keyboard users
  - [ ] 17.5 Create user feedback collection mechanism (optional anonymous usage insights)
  - [ ] 17.6 Write comprehensive accessibility and usability tests

### Phase 4: Testing and QA

- [ ] 18.0 Quality Assurance and Performance Validation
  - [ ] 18.1 Write comprehensive end-to-end tests covering complete user workflows: input → parse → convert → display → copy
  - [ ] 18.2 Add performance benchmarks to validate sub-100ms conversion requirement with realistic test cases
  - [ ] 18.3 Test edge cases: very large numbers, very small numbers, scientific notation, boundary values
  - [ ] 18.4 Validate precision accuracy against known conversion standards and engineering references
  - [ ] 18.5 Run accessibility tests and ensure screen reader compatibility with enhanced error messages
  - [ ] 18.6 Cross-browser testing (Chrome, Firefox, Safari, Edge) and mobile device validation
