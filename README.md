# Soodam - Frontend Application

![Soodam Logo](/public/logo/logo.png)

## Overview

Soodam is a modern web application built with Next.js and React. This frontend application provides a feature-rich user interface with mapping capabilities, data visualization, and form management.

## Table of Contents

- [Features](#features)
- [Technologies](#technologies)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Development](#development)
  - [Running the Development Server](#running-the-development-server)
  - [Building for Production](#building-for-production)
  - [Running Tests](#running-tests)
- [Project Structure](#project-structure)
- [Key Dependencies](#key-dependencies)
- [Maps and Geospatial Features](#maps-and-geospatial-features)
- [State Management](#state-management)
- [Form Handling](#form-handling)
- [Deployment](#deployment)
- [Browser Compatibility](#browser-compatibility)
- [Internationalization](#internationalization)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [Contact](#contact)

## Features

- Interactive maps with Leaflet.js
- Data visualization with Recharts
- Form validation with React Hook Form and Yup
- State management with Redux Toolkit
- Mock API services with MSW
- Responsive UI with Tailwind CSS
- Jalali (Persian) date support

## Technologies

- **Framework:** Next.js 15 with React 18
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** Redux Toolkit
- **Maps:** Leaflet.js, React Leaflet
- **Forms:** React Hook Form with Yup validation
- **API:** Axios
- **Charts:** Recharts
- **Date Handling:** Moment Jalaali, Jalaali-js
- **UI Components:** Headless UI, React Icons, React Select, Swiper
- **Development:** MSW (Mock Service Worker)

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Mersaduv/soodam_app
   cd soodam-front
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Initialize Mock Service Worker:
   ```bash
   npm run mockServiceWorker
   # or
   yarn mockServiceWorker
   ```

## Development

### Running the Development Server

```bash
npm run dev
# or
yarn dev
```

This starts the development server with Turbopack enabled for faster builds. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
# or
yarn build
```

### Running in Production Mode

```bash
npm run start
# or
yarn start
```

## Project Structure

```
src/
├── components/ - Reusable UI components
├── hooks/      - Custom React hooks
├── icons/      - SVG icons used in the application
├── mocks/      - Mock API handlers for development
├── pages/      - Next.js pages and API routes
├── services/   - API service functions
├── store/      - Redux store configuration and slices
├── styles/     - Global styles and Tailwind configuration
├── types/      - TypeScript type definitions
└── utils/      - Utility functions
```

## Key Dependencies

- **@reduxjs/toolkit & react-redux**: State management
- **react-hook-form & yup**: Form handling and validation
- **leaflet & react-leaflet**: Interactive maps
- **recharts**: Data visualization
- **axios**: API requests
- **tailwindcss**: Utility-first CSS framework
- **moment-jalaali & jalaali-js**: Persian calendar support

## Maps and Geospatial Features

The application includes powerful mapping capabilities with:
- Interactive maps using Leaflet.js
- Drawing tools with leaflet-draw
- Geospatial calculations using turf.js and geolib
- Point-in-polygon operations

## State Management

Redux Toolkit is used for global state management with a structured approach using slices for different features.

## Form Handling

Forms are handled using:
- React Hook Form for efficient form state management
- Yup for schema validation
- Custom form components for consistent UI

## Deployment

### Production Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm run start
   ```

### Docker Deployment (Optional)

If using Docker:

```bash
docker build -t soodam-front .
docker run -p 3000:3000 soodam-front
```

## Browser Compatibility

Soodam is optimized for and tested on:
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest version)

## Internationalization

The application includes support for:
- Persian/Farsi calendar using Jalaali
- RTL text direction support
- Localized components for Iranian users

## Troubleshooting

### Common Issues

#### Map Not Loading

- Check if your browser supports Leaflet.js
- Ensure you have an internet connection for loading map tiles
- Try clearing browser cache

#### API Connection Problems

- Verify the backend server is running
- Check network tab in dev tools for specific errors
- Make sure MSW is properly initialized for development

### Development Server Issues

If the development server crashes:
```bash
# Clear Next.js cache
rm -rf .next
# Reinstall dependencies
npm install
# Start dev server again
npm run dev
```

## Mock Service Worker (MSW) Integration

This project uses Mock Service Worker (MSW) to intercept and mock API requests during development. This allows for development and testing without requiring a real backend server.

### Mocked API Endpoints

The following API endpoints are currently mocked:

- `/api/user/profile` - User profile data
- `/api/user/profile` (PUT) - Update user profile
- `/api/user/avatar` - Avatar upload
- `/api/geolocation/get_provinces` - List of provinces
- `/api/geolocation/get_cites_by_id/:provinceId` - List of cities for a province
- `/api/categories` - Categories data
- `/api/features` - Features data
- `/api/advertisements/favorites` - User's favorite advertisements
- `/api/advertisements/nearby` - Nearby advertisements
- `/api/subscription/status` - User subscription status

### How MSW is Configured

MSW is automatically enabled in development mode. The mocks are defined in:

- `src/mocks/handlers.ts` - API request handlers
- `src/mocks/browser.ts` - Browser-specific MSW setup

### Adding New Mock Handlers

To add a new mock API endpoint:

1. Add a new REST handler in `src/mocks/handlers.ts`
2. Follow the pattern of existing handlers, using the `rest` object from MSW

Example:

```javascript
rest.get('/api/some-endpoint', (req, res, ctx) => {
  // Get query params
  const param = req.url.searchParams.get('param')
  
  // Return mock data
  return res(
    ctx.status(200),
    ctx.json({
      data: {
        // Your mock response data
      }
    })
  )
})
```

### Toggling MSW

MSW is automatically enabled in development mode. In production, the real API endpoints are used.

## Contributing

We welcome contributions to Soodam! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

## Contact

- Project Maintainer: [Mersad Karimi](mersadkarimi001@gmail.com)
