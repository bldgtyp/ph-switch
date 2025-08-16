# PH-Switch - Project Specification

## Overview

A simple, user-friendly React web application that enables users to convert values between different units of measurement. The application will provide an intuitive interfac### Phase 2: Core Functionality Implementation

## Target Users & Context

**Primary Users**: Engineers and architects working on building energy modeling, specifically those in the Passive House (PH) community. These professionals frequently need to convert between Imperial (IP) and SI (metric) units while:

- Creating building energy models
- Reviewing product specifications and data sheets
- Working with Passive House tools and software (often SI-based) while operating in US markets (IP-based)
- Performing quick calculations during design reviews and consultations

**Secondary Users**: Broader engineering and design disciplines requiring fast, accurate unit conversions for technical work.

**Design Inspiration**: Google's basic conversion tool, enhanced with specialized unit types and multi-line functionality tailored for building physics and energy modeling professionals.

**Key Problem Solved**: Eliminates the friction of constantly switching between unit systems when US-based Passive House practitioners work with international tools and standards.

## Goals

1. **Primary Goal**: Create a functional unit conversion tool that handles common measurement conversions accurately
2. **User Experience**: Provide an intuitive, responsive interface that works across desktop and mobile devices
3. **Accuracy**: Ensure precise conversion calculations with proper handling of decimal places
4. **Extensibility**: Design the application architecture to easily add new unit categories and conversion types
5. **Performance**: Deliver fast, real-time conversions without noticeable delays

## Requirements

### Functional Requirements

#### Core Features

- **FR-01**: User can input natural language conversion requests using multi-line text input (e.g., "13 meters as feet", "5.5 km to miles")
- **FR-02**: Application parses and tokenizes natural language input to extract value, source unit, and target unit for each line
- **FR-03**: Application supports "as" and "to" keywords for conversion syntax (US English only)
- **FR-04**: Application displays the converted value in real-time as user types valid input on each line
- **FR-05**: Application handles decimal inputs and outputs with smart precision based on unit type and result magnitude
- **FR-06**: Application validates user input and shows error messages for invalid entries or unrecognized units
- **FR-07**: Input validation accepts numeric values in the range 0.001 to 999,999,999

#### Multi-line Session Management

- **FR-08**: Multi-line text area that allows users to enter multiple conversion requests
- **FR-09**: Each line is evaluated independently and shows its conversion result inline
- **FR-10**: Users can edit, delete, or add new lines without affecting other conversions
- **FR-11**: Session state is maintained during browser session but lost on page reload
- **FR-12**: Line-by-line real-time conversion updates as user types
- **FR-13**: Visual separation between different conversion lines for clarity

#### Smart Precision Requirements

- **FR-14**: Dynamic precision adjustment based on unit type and conversion result magnitude
- **FR-15**: Show fewer decimal places for large values (e.g., kilometers, miles) and more for small values (e.g., millimeters, inches)
- **FR-16**: Avoid showing unnecessary trailing zeros while maintaining meaningful precision
- **FR-17**: Ensure precision never exceeds 6 decimal places for readability

#### Unit Categories (Initial Support)

- **FR-18**: Length conversions (meter, foot, inch, centimeter, kilometer, mile, yard)

#### Natural Language Processing

- **FR-19**: Parse input format: "[number] [source unit] [as|to] [target unit]" for each line
- **FR-20**: Support common unit name variations and abbreviations (e.g., "m", "meter", "meters", "ft", "foot", "feet")
- **FR-21**: Case-insensitive unit recognition
- **FR-22**: Handle plural and singular unit forms automatically
- **FR-23**: Provide clear error messages for unparseable input or unrecognized units

#### Intelligent Unit Suggestions

- **FR-24**: Real-time unit matching as user types partial unit names (e.g., "m" shows "meter, millimeter, mile")
- **FR-25**: Context-aware target unit suggestions based on selected source unit
- **FR-26**: Fuzzy matching for common typos and variations in unit names
- **FR-27**: Basic keyboard navigation support for suggestion lists (arrow keys, enter to select, escape to close)
- **FR-28**: Auto-completion when user clicks on a suggested unit
- **FR-29**: Progressive disclosure - show source unit suggestions first, then target unit suggestions
- **FR-30**: Line-specific suggestions that don't interfere with other lines

#### Future Unit Categories (Extensible Architecture)

- **FR-31**: Weight/Mass conversions (kilogram, pound, ounce, gram, ton) - _Future implementation_
- **FR-32**: Temperature conversions (Celsius, Fahrenheit, Kelvin) - _Future implementation_
- **FR-33**: Volume conversions (liter, gallon, milliliter, fluid ounce, cubic meter) - _Future implementation_

#### Extensibility Requirements

- **FR-34**: Modular unit category data structure that allows easy addition of new unit types
- **FR-35**: Conversion factor storage system that supports different conversion methodologies (multiplication-based for length/weight, formula-based for temperature)
- **FR-36**: Component architecture that can dynamically handle new unit categories without code restructuring
- **FR-37**: Extensible unit name recognition system that can accommodate new units and their variations
- **FR-38**: Suggestion system architecture that can scale to multiple unit categories

#### User Interface

- **FR-39**: Multi-line text area for natural language conversion requests (similar to Numi app)
- **FR-40**: Clear placeholder text showing example input format (e.g., "13 meters as feet")
- **FR-41**: Real-time conversion results display inline with each input line using smart precision formatting
- **FR-42**: Dynamic unit suggestion panels that appear as user types on current line
- **FR-43**: Source unit suggestions panel that displays matching units as user types the unit name
- **FR-44**: Target unit suggestions panel that shows valid conversion targets once source unit is recognized
- **FR-45**: Click-to-complete functionality for suggested units
- **FR-46**: Line-by-line editing capabilities with independent conversion results
- **FR-47**: Clean, minimalist design with clear visual hierarchy between lines
- **FR-48**: Responsive layout that works on mobile, tablet, and desktop
- **FR-49**: Clear visual separation between input lines and their results
- **FR-50**: Visual feedback for user actions and input validation states

#### Design & Branding

- **FR-51**: Minimal, modern interface with neutral color palette suitable for technical professionals
- **FR-52**: Clean typography optimized for readability and data display
- **FR-53**: Subtle visual elements that don't distract from functionality
- **FR-54**: Professional appearance appropriate for engineers and technical consultants
- **FR-55**: High contrast design for accessibility and screen readability in various lighting conditions

#### Progressive Web App Features

- **FR-56**: Basic PWA implementation with offline functionality for core conversion features
- **FR-57**: Service worker for caching application assets and enabling offline use
- **FR-58**: Web app manifest for optional installation as a standalone app
- **FR-59**: Responsive design optimized for both web browser and installed app experience
- **FR-60**: Offline-first architecture since all calculations are performed client-side

### Non-Functional Requirements

#### Performance

- **NFR-01**: Conversion calculations complete within 100ms
- **NFR-02**: Application loads completely within 3 seconds on standard broadband
- **NFR-03**: Real-time conversion updates as user types (debounced input)

#### Usability

- **NFR-04**: Application requires no user training or documentation
- **NFR-05**: Error messages are clear and actionable
- **NFR-06**: Full offline functionality after initial load (PWA with service worker caching)

#### Technical

- **NFR-07**: Built using React.js framework
- **NFR-08**: Compatible with modern browsers (Chrome, Firefox, Safari, Edge - last 2 versions)
- **NFR-09**: Mobile-responsive design using CSS Grid/Flexbox
- **NFR-10**: Accessible design meeting WCAG 2.1 AA standards

#### Testing

- **NFR-11**: Comprehensive unit tests for conversion calculation accuracy
- **NFR-12**: Thorough testing of natural language parsing logic and edge cases
- **NFR-13**: Validation of all supported unit variations and abbreviations
- **NFR-14**: Testing of precision handling and smart formatting logic
- **NFR-15**: Manual testing for UI elements and user interactions

#### Data & Security

- **NFR-16**: No user data collection, analytics, or tracking
- **NFR-17**: No user authentication or login system required
- **NFR-18**: All calculations performed client-side
- **NFR-19**: No external API dependencies for core functionality
- **NFR-20**: Basic error logging for maintenance purposes only (anonymous, no personal data)

## Assumptions

1. **Technology Stack**: React.js is the preferred frontend framework for this project
2. **Deployment**: Application will be deployed as a static web application at www.ph-switch.com
3. **Browser Support**: Modern browsers with ES6+ support are the target audience
4. **Internet Connectivity**: Users will have internet access for initial application load
5. **Conversion Accuracy**: Standard conversion factors are sufficient (no specialized scientific conversions needed)
6. **User Base**: Primary users are engineers and architects in the Passive House community, specifically US-based practitioners working with SI-based tools and IP-based local standards
7. **Maintenance**: Conversion factors are static and won't require frequent updates
8. **Localization**: Initial version will be English-only with standard decimal notation
9. **Data Persistence**: Session state maintained during browser session but no persistent storage across page reloads
10. **Third-party Dependencies**: Minimal external libraries preferred to keep bundle size small
11. **Initial Scope**: Development will start with Length conversions only, with architecture designed for easy extension to other unit types
12. **Modular Design**: Unit categories and conversion factors will be stored in a modular, extensible data structure to facilitate future additions
13. **Natural Language Input**: Users will input conversion requests using natural language syntax with "as" and "to" keywords
14. **Input Range**: Numeric values will be limited to the range 0.001 to 999,999,999 for practical everyday use
15. **Language Support**: Initial version supports US English keywords and unit names only
16. **Smart Precision**: Results will use dynamic precision based on unit type and magnitude for optimal user-friendliness
17. **Progressive UI**: Interface will provide intelligent suggestions to guide users through the input process with minimal cognitive load
18. **Minimal Interaction**: Interface focuses on natural language input without complex keyboard shortcuts or power user features
19. **Multi-line Session**: Application maintains a calculator-like multi-line interface similar to Numi, with session-only state management
20. **Target Audience**: Primary users are engineers, energy-modelers, and sustainability consultants who value functionality over visual complexity
21. **Design Philosophy**: Clean, minimal, modern aesthetic with neutral colors and professional appearance
22. **Standalone Application**: No requirement to align with existing PH-Tools branding at this time
23. **Privacy Focus**: No user analytics, tracking, or authentication. Anonymous usage with basic error logging for maintenance only
24. **Testing Focus**: Automated testing will focus on core logic (conversion calculations and natural language parsing) with manual testing for UI elements
25. **PWA Implementation**: Basic Progressive Web App features for offline functionality and optional installation, leveraging client-side architecture

## Open Questions

1. ~~**Unit Categories Priority**: Which unit categories should be implemented first? Should we start with length/distance as mentioned in the example?~~ **RESOLVED**: Starting with Length conversions only, with modular architecture for future extensions.
2. ~~**Input Validation**: What should be the maximum/minimum values accepted? Should we support scientific notation?~~ **RESOLVED**: Accept values 0.001 to 999,999,999 with natural language input parsing (e.g., "13 meters as feet").
3. ~~**Precision Handling**: How many decimal places should be displayed in results? Should this be configurable?~~ **RESOLVED**: Implement smart precision that dynamically adjusts based on unit type and result magnitude for optimal user-friendliness.
4. ~~**Unit Organization**: Should units be grouped by category in the UI, or presented in a flat list?~~ **RESOLVED**: Implement dynamic suggestion panels - source unit suggestions as user types, then target unit suggestions based on selected source unit.
5. ~~**Keyboard Shortcuts**: Should we implement keyboard shortcuts for common actions (like swapping units)?~~ **RESOLVED**: Keep keyboard interaction minimal - only basic navigation for suggestions (arrows, enter, escape). Focus on natural language input.
6. ~~**Favorites/Recents**: Would users benefit from a "recently used" or "favorite conversions" feature?~~ **RESOLVED**: Implement multi-line session-based interface (like Numi) where users can maintain multiple conversions in a session, but no persistent storage across page reloads.
7. ~~**Branding**: What visual design language should be used? Any specific color schemes or branding requirements?~~ **RESOLVED**: Clean, minimal, modern design with neutral colors. Professional appearance for engineers and technical consultants. No existing brand alignment required.
8. ~~**Analytics**: Do we need to track usage patterns or popular conversions?~~ **RESOLVED**: No analytics or user tracking. Privacy-focused approach with anonymous usage. Basic error logging for maintenance only.
9. ~~**Testing Strategy**: What level of automated testing is required (unit tests, integration tests, e2e)?~~ **RESOLVED**: Focus on core logic testing - comprehensive unit tests for conversion calculations and natural language parsing. Manual testing for UI elements.
10. ~~**Progressive Web App**: Should this be a PWA with offline capabilities and app-like installation?~~ **RESOLVED**: Implement basic PWA features with offline functionality and optional installation. Client-side architecture makes this natural and beneficial for field work.

## Step-by-Step Plan

### Phase 1: Project Setup and Foundation ✅ **COMPLETE**

1. **Initialize React Application** ✅ **COMPLETE**
   - ✅ Set up new React project using Create React App
   - ✅ Configure TypeScript and ESLint/Prettier
     - ✅ Set up basic project structure and folders

2. **Design Core Data Structure** ✅ **COMPLETE**
   - ✅ Define unit categories and conversion factors
   - ✅ Create data models for units and conversions
   - ✅ Implement conversion calculation logic

3. **Create Basic UI Components** ✅ **COMPLETE**
   - ✅ Design and implement input field component
   - ✅ Create result display component
   - ✅ Build main converter app component

### Phase 2: Core Functionality Implementation

4. **Implement Unit Selection** ✅ **COMPLETE**
   - ✅ Add intelligent unit suggestions based on partial input
   - ✅ Implement context-aware target unit suggestions
   - ✅ Add auto-completion functionality with click-to-complete
   - ✅ Support progressive disclosure (source unit first, then target unit)
   - ✅ Handle real-time unit matching as user types

5. **Build Conversion Engine** ✅ **COMPLETE**
   - ✅ Implement conversion calculations
   - ✅ Add input validation and error handling
   - ✅ Ensure real-time updates with proper debouncing

6. **Add Bidirectional Conversion** ✅ **COMPLETE**
   - ✅ Implement swap functionality
   - ✅ Ensure state consistency when swapping units
   - ✅ Add visual swap button/control

### Phase 3: User Experience Enhancement

7. **Responsive Design Implementation** ✅ **COMPLETE**
   - ✅ Create mobile-first responsive layout
   - ✅ Optimize for touch interfaces
   - ✅ Test across different screen sizes

8. **Polish User Interface** ✅ **COMPLETE**

- ✅ Apply consistent styling and theming
- ✅ Add visual feedback and micro-interactions
- ✅ Implement accessibility features

9. **Input/Output Refinements**

- Fine-tune decimal precision handling
- Improve input validation and error messages
- Add helpful placeholder text and labels

### Phase 4: Testing and Optimization

10. **Quality Assurance** - Write unit tests for conversion logic - Perform cross-browser testing - Conduct user acceptance testing

11. **Performance Optimization** - Optimize bundle size and loading performance - Implement efficient re-rendering strategies - Test on various devices and connection speeds

12. **Accessibility and Standards Compliance** - Ensure WCAG compliance - Test with screen readers and keyboard navigation - Validate HTML and check semantic markup

### Phase 5: Deployment and Documentation

13. **Deployment Setup** - Configure build process for production - Set up hosting and deployment pipeline - Configure domain and SSL if applicable

14. **Documentation and Handoff** - Create user documentation (if needed) - Document code and architecture - Prepare maintenance and extension guidelines

---

_This specification is a living document and should be updated as requirements evolve and questions are answered._
