# Health Map

An interactive web application that visualizes health facilities across different regions using an interactive map interface. This project helps users locate and explore healthcare facilities with filtering capabilities based on facility types and locations.

## Features

- Interactive map visualization using Leaflet.js
- Health facility markers with detailed information
- Filter facilities by type and location
- Color-coded facility markers for easy identification
- Responsive legend showing facility types
- CSV data integration for facility information

## Technologies Used

- **TypeScript** - For type-safe JavaScript development
- **Vite** - Next generation frontend tooling
- **Leaflet.js** - For interactive maps
- **Papa Parse** - For CSV parsing
- **HTML/CSS** - For structure and styling

## Getting Started

### Prerequisites

- Node.js (Latest LTS version recommended)
- npm (comes with Node.js)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/tony-nyagah/health-map.git
   cd health-map
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## Project Structure

- `/src` - Contains the TypeScript source code
- `/public` - Static assets
- `/data` - CSV data files for health facilities
- `index.html` - Main HTML entry point
- `vite.config.js` - Vite configuration
- `tsconfig.json` - TypeScript configuration

## Development

The application is built using TypeScript and Vite for a modern development experience. It uses Leaflet.js for map rendering and Papa Parse for handling CSV data. The project follows a modular structure for better maintainability and scalability.

## Building for Production

To create a production build:

```bash
npm run build
```

This will generate a `dist` directory with the production-ready files.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
