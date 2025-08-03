# EquityConnect - Business & Real Estate Investment Platform

## Overview

EquityConnect is a sophisticated web application that connects business and real estate buyers seeking 10% equity injections for SBA and non-SBA acquisition loans with investors willing to provide the funds. The platform features a tiered investment system, secure document management, real-time messaging, video call scheduling, and integrated payment processing through Stripe.

The application follows a modern full-stack architecture with separate client and server directories, shared schema definitions, and a PostgreSQL database. It implements role-based access control, distinguishing between buyers who can post funding requests and investors who can browse and respond to opportunities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for fast development
- **UI Library**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with custom financial industry color palette
- **State Management**: TanStack Query for server state and React Context for authentication
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation
- **Payment Integration**: Stripe React components for secure payment processing

### Backend Architecture
- **Runtime**: Node.js with Express.js server framework
- **Authentication**: Passport.js with local strategy and session-based auth
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **Database ORM**: Drizzle ORM with type-safe schema definitions
- **Build System**: ESBuild for production bundling and tsx for development

### Database Design
- **Primary Database**: PostgreSQL with Neon serverless connection pooling
- **Schema Management**: Drizzle Kit for migrations and schema evolution
- **Key Entities**: Users (buyers/investors), Listings (with tier-based pricing), Documents (with access controls), Conversations, Messages, Video Call Requests
- **Tiered Investment Structure**: Four investment tiers (Starter: $100K-$350K, Growth: $350K-$1M, Scale: $1M-$3M, Enterprise: $3M-$25M)

### Authentication & Authorization
- **User Roles**: Strict role-based access with buyers and investors having different capabilities
- **Password Security**: Scrypt-based password hashing with salt
- **Session Management**: Secure HTTP-only sessions with PostgreSQL persistence
- **Route Protection**: Client-side route guards with server-side validation

### Payment Processing
- **Provider**: Stripe with separate public/secret key configuration
- **Flow**: Intent-based payments for listing fees with confirmation webhooks
- **Pricing Structure**: Tier-based listing fees ($500-$5000) based on investment amount ranges

### Document Management
- **Upload System**: Drag-and-drop interface with progress tracking
- **Access Control**: Granular permissions for document viewing and downloading
- **Security**: Document redaction capabilities and investor-specific access grants

### Communication Features
- **Real-time Messaging**: Conversation threads between buyers and investors
- **Video Calls**: Scheduled video call requests with meeting link generation
- **Notifications**: Toast-based user feedback system

## External Dependencies

### Core Infrastructure
- **Database**: Neon PostgreSQL serverless with connection pooling
- **Payment Processing**: Stripe for secure payment handling and subscription management
- **Session Storage**: PostgreSQL-backed session persistence

### Development & Build Tools
- **Replit Integration**: Custom Replit development plugins and error modal overlay
- **Build Pipeline**: Vite for frontend bundling, ESBuild for backend compilation
- **Development Server**: Hot module replacement with TypeScript compilation

### UI & Styling Framework
- **Component Library**: Comprehensive Radix UI primitive components
- **Design System**: shadcn/ui with New York style variant
- **Icon Library**: Lucide React for consistent iconography
- **Form Validation**: Zod schema validation with React Hook Form resolvers

### Utilities & Libraries
- **Date Handling**: date-fns for date formatting and manipulation
- **Styling Utilities**: clsx and tailwind-merge for conditional styling
- **Class Variants**: class-variance-authority for component variant management
- **WebSocket Support**: ws library for Neon database connections