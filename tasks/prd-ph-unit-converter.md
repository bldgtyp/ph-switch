# Product Requirements Document: PH-Switch Unit Converter

## Introduction/Overview

PH-Switch is a lightweight, specialized unit conversion tool designed for Passive House designers and engineers working in the US market. The application addresses the critical need for fast, accurate conversions between Imperial (IP) and International System (SI) units, particularly for specialized engineering units not commonly found in general-purpose converters (e.g., "Btu/hr-ft²" to "W/m²").

The tool features a Google Translate-inspired interface with natural language input parsing, enabling professionals to perform quick conversions during active engineering work without interrupting their workflow.

**Goal:** Create a fast, lightweight, extensible unit converter that handles specialized Passive House engineering units through natural language input.

## Goals

1. **Speed & Efficiency**: Enable sub-second unit conversions during active engineering tasks
2. **Specialized Coverage**: Support engineering units not found in typical converters, starting with Passive House thermal calculations
3. **Natural Interface**: Allow conversions through natural language input ("134 meters as feet")
4. **Professional Integration**: Minimize workflow disruption for engineering professionals
5. **Extensibility**: Enable easy addition of new unit categories and types
6. **Accessibility**: Work offline and be deployable anywhere as a static web application

## User Stories

**Primary User: Passive House Engineer/Designer**

1. **As a Passive House engineer**, I want to quickly convert "25 Btu/hr-ft²" to "W/m²" while reviewing energy models, so that I can verify calculations without switching applications.

2. **As a building designer**, I want to type "2.5 inches to millimeters" and get instant results, so that I can convert drawing dimensions during design review.

3. **As an energy consultant**, I want to process multiple conversions simultaneously (like Google Translate), so that I can convert entire lists of values efficiently.

4. **As a professional user**, I want the app to remember my recent conversions in local storage, so that I can quickly re-reference common values.

5. **As a specialist engineer**, I want to easily add new unit types via configuration files, so that I can extend the tool for project-specific requirements.

## Functional Requirements

### Core Conversion Engine

1. The system must parse natural language input using strict format with "as" or "to" keywords only (e.g., "134 meters as feet", "5 ft to meters")
2. The system must support multi-line input with each line processed independently
3. The system must provide instant conversion results as the user types
4. The system must handle comprehensive unit aliases including: full names, abbreviations, common variations, and engineering notation (e.g., "meter", "metre", "meters", "m")
5. The system must display conversion results in a clear, copy-friendly format
6. If unknown units are input, provide detailed error messages with unit suggestions (e.g., "Unknown unit 'mtr'. Did you mean 'meter'?")

### Unit Support (Initial Release)

7. The system must support comprehensive length units: meter, foot, inch, millimeter, centimeter, kilometer, yard, mile
8. The system must maintain high precision for engineering calculations (minimum 6 significant figures)
9. The system must handle both full unit names and standard abbreviations
10. The system must display all conversion results formatted to exactly 3 decimal places with comma separators for thousands (e.g., "1,234.567")

### User Interface

11. The interface must follow a minimal, Google Translate-inspired design
12. The system must support simultaneous multiple conversion lines
13. The system must allow users to click results to copy values to clipboard
14. The interface must be responsive and work on desktop and tablet devices
15. The system must provide clear visual feedback for successful conversions and parsing errors
16. The system should expand (vertically) to accommodate more lines when the user inputs a newline (return)
17. Mobile and desktop both have side-by-side panels (input on left, results on right)

### Data Management

18. The system must store recent conversions in browser local storage
19. The system must NOT require any external database or server connections
20. The system must work completely offline after initial page load

### Extensibility

21. The system must use JSON configuration files organized by category, with separate files for each unit type (length.json, volume.json, density.json, thermal.json, etc.)
22. The system must support adding new unit types by modifying existing JSON files or adding new category files
23. The configuration system must support categories: length, energy, volume, density, thermal properties, etc.
24. The system must allow for easy addition of specialized engineering units through configuration

### Performance

25. The system must complete conversions in under 100ms for responsive user experience
26. The system must load initial interface in under 2 seconds on standard broadband
27. The system must function as a static web application deployable to any web server

## Non-Goals (Out of Scope)

1. **Currency Conversion**: No real-time exchange rates or financial calculations
2. **Complex Calculations**: No multi-step engineering calculations or formula solving
3. **User Accounts**: No login system, user profiles, or cloud synchronization
4. **Mobile App**: Initial release targets web browsers only
5. **User Accounts**: No login system, user profiles, or cloud synchronization
6. **Mobile App**: Initial release targets web browsers only - desktop-first design with mobile scaling
7. **Advanced NLP**: No support for complex sentence structures beyond "X unit as Y unit"
8. **Database Integration**: No server-side data storage or external APIs
9. **Collaboration Features**: No sharing, comments, or multi-user functionality
10. **Print/Export**: No PDF generation or advanced export capabilities
11. **Admin Interface**: No in-app unit configuration UI - JSON files edited by developer only
12. **Bulk Processing**: No paste-in of large text blocks - multi-line input only

## Design Considerations

### UI/UX Requirements

- **Reference Design**: Google Translate interface paradigm and `google_translate.png`
- **UI Mockup**: Refer to `ui_mockup.png` for simple layout wireframe
- **Input Method**: Single text input field supporting multi-line natural language
- **Visual Hierarchy**: Clear separation between input and results
- **Accessibility**: Keyboard navigation, proper ARIA labels, high contrast support
- **Error Handling**: Graceful handling of unrecognized units or malformed input

### Technical Architecture

- **Frontend**: React-based single-page application
- **Styling**: Modern CSS (CSS Modules or Styled Components)
- **State Management**: React hooks (useState, useEffect) for local state
- **Storage**: Browser localStorage for persistence
- **Parsing**: Custom natural language parser for strict unit conversion syntax ("X unit as/to Y unit")
- **Code Style**: Prioritize readability and maintainability over succinctness.

## Technical Considerations

### Configuration System

- **Unit Definitions**: JSON files organized by category with separate files for each type (length.json, volume.json, density.json, thermal.json, etc.)
- **Alias Support**: Each unit definition must include arrays of valid aliases (full names, abbreviations, common variations)
- **Conversion Factors**: Base unit approach with multiplication factors
- **Extensibility**: Hot-loading of new configuration files without code changes
- **Validation**: Schema validation for unit configuration files

### Performance Optimization

- **Parsing Efficiency**: Pre-compiled unit recognition patterns
- **Calculation Speed**: Optimized conversion algorithms
- **Memory Management**: Efficient caching of parsed conversions
- **Bundle Size**: Minimal dependencies to ensure fast loading

### Browser Compatibility

- **Target Browsers**: Modern Chrome, Firefox, Safari, Edge (last 2 versions)
- **Fallbacks**: Graceful degradation for older browsers
- **Local Storage**: Fallback handling for storage limitations

### Data & Security

- **Users**: No user data collection, analytics, or tracking
- **Auth**: No user authentication or login system required
- **Server | Client**: All calculations performed client-side
- **APIs**: No external API dependencies for core functionality
- **Errors**: Basic error logging for maintenance purposes only (anonymous, no personal data)

## Success Metrics

### User Experience Metrics

1. **Conversion Speed**: 95% of conversions complete in under 100ms
2. **Parse Accuracy**: 98% success rate for properly formatted natural language input
3. **User Retention**: Professionals return to use the tool at least weekly

### Technical Performance Metrics

4. **Load Time**: Initial page load under 2 seconds on 3G connection
5. **Accuracy**: All conversions accurate to 6 significant figures minimum
6. **Uptime**: 99.9% availability as static web application

### Business/Adoption Metrics

7. **Professional Usage**: Positive feedback from 10+ Passive House professionals
8. **Extensibility**: Successfully add 3+ new unit categories within 6 months
9. **Workflow Integration**: Users report reduced time spent on unit conversions

## Open Questions

~~1. **Unit Aliases**: Should we support multiple naming conventions for the same unit (e.g., "metre" vs "meter")?~~ **RESOLVED**: Comprehensive alias support - unit JSON files will include arrays of valid aliases for maximum user-friendliness.

~~2. **Precision Display**: How many decimal places should be shown in results by default?~~ **RESOLVED**: All results display exactly 3 decimal places with comma thousands separators (e.g., "1,234.567").

~~3. **Natural Language Parsing Strictness**: How flexible should the parser be?~~ **RESOLVED**: Strict format only - requires "as" or "to" keywords (e.g., "5 meters to feet"). Future versions may add flexibility.

~~4. **JSON Configuration Structure**: How should unit definitions be organized?~~ **RESOLVED**: Category-based files - separate JSON files for each unit type (length.json, volume.json, density.json, thermal.json, etc.).

~~5. **Error Messaging**: What level of detail should error messages provide for parsing failures?~~ **RESOLVED**: Detailed error messages with unit suggestions (e.g., "Unknown unit 'mtr'. Did you mean 'meter'?").

~~6. **Configuration UI**: Should there be an admin interface for modifying unit configurations, or is file editing acceptable?~~ **RESOLVED**: File editing only - JSON files added to app directly by author/developer.

~~7. **Batch Processing**: Should we support paste-in of large text blocks with multiple conversions?~~ **RESOLVED**: Multi-line only - current approach where user types one conversion per line.

~~8. **Unit Discovery**: How should users discover available units and their abbreviations?~~ **RESOLVED**: Auto-suggest dropdown (Phase 3) - show unit suggestions as user types (e.g., "me" shows "meter").

~~9. **Mobile Optimization**: What mobile-specific UX considerations should be prioritized for future releases?~~ **RESOLVED**: Desktop-first approach - mobile is scaled-down version of desktop layout.

## Implementation Priority

### Phase 1 (UI Mockup)

- Basic React application setup
- React UI layout and component architecture
- Mock language parser and converter (for testing UI)
- Desktop-first responsive design (mobile scales down)

### Phase 2 (MVP)

- Replace Mock parser and converter with functioning natural language parser
- Length unit conversions only
- Local storage for recent conversions
- Detailed error messaging with unit suggestions
- Category-based JSON configuration system (length.json)

### Phase 3 (Enhanced Features)

- Auto-suggest dropdown for unit discovery
- Additional unit categories (thermal, volume, density, etc.)
- Performance optimizations
- Enhanced error handling and user feedback
