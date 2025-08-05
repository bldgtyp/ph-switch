# PH-Switch

A simple, user-friendly React web application that enables users to convert values between different units of measurement. Specifically designed for engineers and architects working on building energy modeling in the Passive House (PH) community.

## Overview

PH-Switch provides an intuitive interface for converting between Imperial (IP) and SI (metric) units through natural language input. Users can enter conversion requests like "13 meters as feet" and get real-time results.

## Key Features

- **Natural Language Input**: Enter conversions using simple phrases like "5.5 km to miles"
- **Multi-line Interface**: Handle multiple conversions simultaneously in a calculator-like interface
- **Real-time Conversion**: See results as you type
- **Smart Precision**: Dynamic decimal place handling based on unit type and magnitude
- **Unit Suggestions**: Intelligent auto-completion for unit names
- **Mobile Responsive**: Works seamlessly on desktop and mobile devices
- **Offline Capable**: Progressive Web App with offline functionality

## Target Users

- **Primary**: Engineers and architects in the Passive House community
- **Secondary**: Broader engineering and design disciplines requiring unit conversions

## Development Status

🚧 **In Development** - This project is currently in the planning and initial development phase.

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/bldgtyp/ph-switch.git
   cd ph-switch
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run lint` - Runs ESLint to check for code issues
- `npm run lint:fix` - Runs ESLint and automatically fixes issues
- `npm run format` - Formats code using Prettier
- `npm run format:check` - Checks if code is formatted correctly

### Project Structure

```
src/
├── components/     # React components
├── data/          # Unit definitions and conversion factors
├── hooks/         # Custom React hooks
├── types/         # TypeScript type definitions
└── utils/         # Utility functions and helpers
```

## Contributing

This project is part of the PH-Tools organization. Contributions are welcome!

## License

_License information will be added._

---

**Project Specification**: See `specification.md` for detailed requirements and implementation plan.
