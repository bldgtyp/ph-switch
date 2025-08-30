# PH-Switch

[![Tests](https://github.com/bldgtyp/ph-switch/actions/workflows/ci.yml/badge.svg)](https://github.com/bldgtyp/ph-switch/actions/workflows/ci.yml)
[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://bldgtyp.github.io/ph-switch/)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![PWA Ready](https://img.shields.io/badge/PWA-ready-purple)](https://web.dev/progressive-web-apps/)

**Fast unit switching for Passive House designers**

PH-Switch is a specialized unit conversion tool designed specifically for Passive House professionals. It provides instant, precise conversions for the most commonly used units in building physics and energy modeling.

## Quick Start

### 🌐 **Live Application**

**Try PH-Switch: [https://bldgtyp.github.io/ph-switch/](https://bldgtyp.github.io/ph-switch/)**

The latest version is always available through GitHub Pages - no installation required! You can also use Google Chrome to install PH-Switch as a PWA for even easier use.

### Try it Live

1. Type a conversion like "5 meters to feet"
2. See instant results: "16.4042 feet"
3. Click the result to copy "16.4042" to clipboard
4. Paste the numeric value anywhere you need it

### Example Conversions

```
5 meters to feet          → 16.4042 feet
100 cfm to m³/h          → 169.9011 m³/h
20°C to °F               → 68°F
1000 Btu to kWh          → 0.2931 kWh
50 Pa to inH2O           → 0.2008 inH2O
```

## Features

### 🚀 **Instant Conversions**

Type natural language conversions like "5 meters to feet" or "100 cfm to m³/h" and get immediate results.

### 📋 **Smart Copy-to-Clipboard**

Click any result to copy just the numeric value (without units) directly to your clipboard - perfect for pasting into spreadsheets, calculations, or other applications.

### 🎯 **Category-Aware AutoSuggest**

Intelligent suggestions that filter units based on compatibility. When you type "5 m to f", only length units starting with "f" are suggested, not airflow or other incompatible units.

### 📝 **Multi-line Support**

Process multiple conversions at once:

```
5 meters to feet
100 cfm to m³/h
20°C to °F
```

### 🏠 **Passive House Focused**

Comprehensive unit support for building physics including:

- **Length**: meters, feet, inches, millimeters
- **Area**: m², ft², in²
- **Volume**: m³, ft³, liters, gallons
- **Airflow**: cfm, m³/h, l/s, ft³/min
- **Energy**: kWh, Btu, kJ, Wh
- **Power**: watts, kW, Btu/h, tons
- **Temperature**: Celsius, Fahrenheit, Kelvin
- **Pressure**: Pa, psi, inH2O, bar
- **And many more...**

## Installation & Development

### Prerequisites

- Node.js 16+
- npm or yarn

### Setup

```bash
# Clone the repository
git clone https://github.com/bldgtyp/ph-switch.git
cd ph-switch

# Install dependencies
npm install

# Start development server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### Available Scripts

#### `npm start`

Runs the app in development mode with hot reloading.

#### `npm test`

Launches the test runner. Includes 388 comprehensive tests covering:

- Unit conversion accuracy
- AutoSuggest filtering
- Copy functionality
- Error handling
- Multi-line processing

#### `npm run build`

Builds the app for production to the `build` folder with optimized bundles.

#### `npm run eject`

⚠️ **One-way operation** - Exposes all configuration files for advanced customization.

## Architecture

### Core Components

- **ConversionInput**: Smart textarea with category-aware AutoSuggest
- **ConversionOutput**: Results display with numeric copy functionality
- **Unit System**: JSON-based configuration supporting 25+ unit categories
- **Parser**: Natural language processing for conversion expressions

### Key Technologies

- **React 18** with TypeScript
- **Decimal.js** for high-precision calculations
- **JSON Schema** validation for unit configurations
- **Jest + React Testing Library** for comprehensive testing

### Browser Support

- Modern browsers with ES2015+ support
- Clipboard API with graceful fallback
- Responsive design for desktop and mobile

## Use Cases

### Passive House Designers

- Quick unit conversions during design calculations
- Importing/exporting data between different software tools
- Verification of calculation results in different unit systems

### Building Physics Engineers

- Energy modeling with mixed unit systems
- Compliance calculations requiring specific units
- Data analysis and reporting

### HVAC Professionals

- Airflow and pressure calculations
- Equipment sizing with manufacturer specifications
- Performance analysis across different standards

## Privacy & Offline Use

- **No data collection** - All calculations performed locally
- **Works offline** - Full functionality without internet connection
- **No tracking** - No analytics, cookies, or user monitoring
- **Open source** - Transparent, auditable code

## Contributing

Contributions are welcome! Please see our contributing guidelines for:

- Adding new unit categories
- Improving conversion accuracy
- Enhancing user experience
- Expanding test coverage

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For questions, suggestions, or issues:

- Open an issue on GitHub
- Check the documentation in `/docs`
- Review existing unit configurations in `/src/config`

## Development

This project was developed with assistance from AI tools to accelerate development and ensure comprehensive testing coverage. All code has been reviewed, tested, and validated for accuracy in building physics applications.

---

**Made for Passive Housers • No data collected • Works offline**
