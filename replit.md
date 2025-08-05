# InsuraClaims AI

## Overview

InsuraClaims AI is a comprehensive claims analysis platform that automates insurance claim processing using AI and document analysis. The application processes PDF policy documents, extracts relevant sections, and uses AI to analyze insurance claims against policy terms. It features a React frontend with a modern UI, an Express.js backend, and Python services for PDF processing and AI analysis.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend is built with React and TypeScript, using Vite as the build tool. The architecture follows a component-based design with:

- **UI Framework**: Radix UI components with Tailwind CSS for styling using the "new-york" variant
- **State Management**: TanStack React Query for server state management and data fetching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation for type-safe form management
- **Component Library**: Extensive shadcn/ui component system with custom styling

### Backend Architecture
The backend uses Express.js with TypeScript in a RESTful API pattern:

- **Server Framework**: Express.js with middleware for request logging and error handling
- **File Handling**: Multer for PDF file uploads with size limits and type validation
- **API Design**: RESTful endpoints for documents, claims, and analyses
- **Development**: Vite integration for hot reloading in development mode

### Data Storage
The application uses a dual storage approach:

- **Production Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Development Storage**: In-memory storage implementation for rapid development
- **Schema Management**: Drizzle Kit for database migrations and schema management
- **Database Provider**: Neon Database serverless PostgreSQL

### Document Processing Pipeline
The system implements a sophisticated PDF processing workflow:

- **PDF Parsing**: PyMuPDF (fitz) for text extraction and document structure analysis
- **Text Processing**: Heuristic-based section detection and content classification
- **Vector Search**: Sentence Transformers with FAISS for semantic document search
- **Content Filtering**: Automatic removal of headers, footers, and boilerplate content

### AI Analysis Engine
The AI analysis system combines multiple technologies:

- **Embeddings**: BAAI/bge-base-en-v1.5 model for text embeddings
- **Similarity Search**: FAISS for efficient vector similarity matching
- **External AI**: Integration with external AI APIs for claim decision making
- **Query Processing**: Natural language query understanding for claim analysis

### Session Management
The application implements secure session handling:

- **Session Store**: PostgreSQL-based session storage using connect-pg-simple
- **Authentication**: Cookie-based session management with secure defaults
- **Security**: Proper session configuration for production environments

## External Dependencies

### Core Framework Dependencies
- **React 18**: Frontend framework with TypeScript support
- **Express.js**: Backend web framework
- **Vite**: Build tool and development server
- **Drizzle ORM**: Type-safe database toolkit

### Database Services
- **Neon Database**: Serverless PostgreSQL provider (@neondatabase/serverless)
- **PostgreSQL**: Primary database engine

### AI and ML Services
- **Sentence Transformers**: Text embedding generation (sentence-transformers)
- **FAISS**: Vector similarity search library
- **External AI API**: Third-party AI service for claim analysis decisions

### UI and Styling
- **Radix UI**: Comprehensive component library for accessible UI primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library

### File Processing
- **PyMuPDF**: PDF parsing and text extraction
- **Multer**: File upload handling middleware

### Development Tools
- **TypeScript**: Static type checking
- **ESBuild**: JavaScript bundler for production builds
- **TSX**: TypeScript execution for development
- **Replit Plugins**: Development environment integration

### Python Environment
- **Python 3**: Runtime for PDF processing and AI services
- **NumPy**: Numerical computing for vector operations
- **Requests**: HTTP client for external API calls