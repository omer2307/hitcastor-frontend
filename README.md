# Hitcastor Frontend

Modern React frontend for the Hitcastor prediction market platform. Built with Vite, TypeScript, React, ShadCN/UI, and Tailwind CSS.

## Project Overview

Hitcastor is a prediction market platform focused on Spotify chart rankings. This frontend application provides a sleek, modern interface for users to:

- View live Spotify chart data and trends
- Place predictions on song rankings
- Track market movements and pricing
- Manage their prediction portfolios
- View resolution results and payouts

## Technology Stack

- **Vite** - Fast build tool and development server
- **TypeScript** - Type-safe JavaScript
- **React 18** - Modern React with hooks and concurrent features
- **ShadCN/UI** - Beautiful, accessible component library
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Unstyled, accessible UI primitives
- **React Hook Form** - Performant form management
- **React Query** - Data fetching and state management
- **React Router** - Client-side routing
- **Recharts** - Chart and visualization library

## Features

- 📊 **Real-time Charts** - Live Spotify chart data visualization
- 🎯 **Prediction Markets** - Intuitive betting interface
- 💰 **Portfolio Management** - Track your predictions and returns
- 🌙 **Dark/Light Mode** - Theme switching with next-themes
- 📱 **Responsive Design** - Works perfectly on all devices
- ♿ **Accessibility** - Built with accessibility in mind
- 🎨 **Modern UI** - Clean, professional interface

## Development

### Prerequisites

- Node.js 20+ 
- npm, yarn, or pnpm

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
```

### Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── hooks/              # Custom React hooks  
├── lib/                # Utilities and configurations
├── types/              # TypeScript type definitions
└── styles/             # Global styles
```

## Integration with Hitcastor Backend

This frontend integrates with the Hitcastor ecosystem:

- **hitcastor-api** - REST API for market data and user actions
- **hitcastor-kyc-gateway** - KYC verification and geofencing
- **hitcastor-sdk** - TypeScript SDK for blockchain interactions
- **Smart Contracts** - Market factory, prediction markets, oracle resolution

## Environment Variables

Create a `.env.local` file:

```env
VITE_API_URL=http://localhost:8080
VITE_KYC_URL=http://localhost:8070
VITE_RPC_URL=http://localhost:8545
VITE_CHAIN_ID=31337
VITE_FACTORY_ADDRESS=0x...
VITE_RESOLVER_ADDRESS=0x...
```

## Deployment

The application can be deployed to:

- **Lovable** - https://lovable.dev (original creation platform)
- **Vercel** - Zero-config deployment
- **Netlify** - Static site hosting
- **AWS S3 + CloudFront** - Scalable static hosting

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT License - see LICENSE file for details.