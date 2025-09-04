# Discord Stream Monitor Bot

## Overview

This is a Discord bot application designed to monitor Twitch streamers and provide automated stream announcements. The system tracks RSRP GTA V streamers, automatically assigns Discord roles when they go live, and sends stream announcements to designated channels. It features a web dashboard for configuration and monitoring, built with React and Express.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client is built using React with TypeScript and leverages modern UI patterns:
- **Component Library**: Shadcn/ui components with Radix UI primitives for accessible, customizable UI elements
- **Styling**: Tailwind CSS with CSS variables for theming support and dark mode
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
The server follows a REST API pattern with Express.js:
- **Framework**: Express.js with TypeScript for type safety
- **Data Storage**: In-memory storage with interfaces designed for easy database migration
- **External Integrations**: Discord.js for bot functionality and Twitch API for stream monitoring
- **Session Management**: Connect-pg-simple for PostgreSQL session storage (when database is connected)

### Database Design
The schema is defined using Drizzle ORM with PostgreSQL as the target database:
- **Users Table**: Basic authentication with username/password
- **Streamers Table**: Discord user mapping with Twitch usernames and live status tracking
- **Bot Settings Table**: Configurable bot behavior (roles, channels, intervals)
- **Activities Table**: Activity logging for dashboard insights

### Authentication & Authorization
Currently implements a simple session-based authentication system with plans for more robust user management. The bot uses Discord Bot Token authentication for Discord API interactions.

### External Service Integrations
- **Discord Bot**: Monitors guild members with specific roles and manages live streaming roles
- **Twitch API**: Fetches stream status and metadata for tracked streamers
- **Neon Database**: PostgreSQL database service for production data persistence

### Development & Deployment Architecture
- **Development**: Vite dev server with HMR and Express API proxy
- **Production**: Static file serving with Express for both client and API routes
- **Build Process**: Vite for client bundling and esbuild for server compilation
- **Environment**: Designed for Replit deployment with specific plugins and configuration

## External Dependencies

### Core Framework Dependencies
- **React 18**: Frontend framework with modern hooks and concurrent features
- **Express.js**: Web framework for API routes and static file serving
- **TypeScript**: Type safety across both client and server code
- **Vite**: Build tool and development server

### UI & Styling
- **Shadcn/ui + Radix UI**: Component library with accessibility primitives
- **Tailwind CSS**: Utility-first CSS framework with custom theming
- **Lucide React**: Icon library for consistent iconography

### Data & State Management
- **TanStack Query**: Server state management with intelligent caching
- **Drizzle ORM**: Type-safe database schema definition and queries
- **Zod**: Schema validation for API endpoints and forms

### External APIs & Services
- **Discord.js**: Official Discord API library for bot functionality
- **Twitch API**: Stream status monitoring and user data retrieval
- **Neon Database**: Serverless PostgreSQL hosting service

### Development & Build Tools
- **ESBuild**: Fast JavaScript bundler for server code
- **PostCSS**: CSS processing with Tailwind integration
- **Replit Plugins**: Development environment integration and error handling

### Authentication & Session Management
- **Connect-pg-simple**: PostgreSQL session store for Express sessions
- **Crypto**: Built-in Node.js module for UUID generation and security

The architecture is designed for easy scalability, with clear separation between the Discord bot service, web dashboard, and data persistence layers.