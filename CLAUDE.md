# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This is a full-stack application with:
- **Frontend**: Next.js 14 app with TypeScript, Tailwind CSS, and shadcn/ui components
- **Backend**: FastAPI server with REST API endpoints for campaigns, analytics, and templates

## Common Commands

### Frontend (my-app/)
```bash
cd my-app
npm run dev        # Start development server on localhost:3000
npm run build      # Build production bundle
npm run lint       # Run ESLint
npm start          # Run production server
```

### Backend (backend/)
```bash
cd backend
python3 main.py    # Run the FastAPI server on localhost:8000
# or
uvicorn main:app --reload  # Alternative way to run with uvicorn directly
```

FastAPI automatically provides:
- Interactive API documentation at http://localhost:8000/docs
- Alternative API documentation at http://localhost:8000/redoc

## Architecture Overview

### Backend API
The FastAPI backend provides REST API endpoints:
- **Health Check**: `GET /health` - API health status
- **Campaigns**: 
  - `GET /api/campaigns` - List all campaigns
  - `POST /api/campaigns` - Create new campaign
- **Analytics**: `GET /api/analytics/overview` - Analytics dashboard data
- **Templates**: `GET /api/templates` - Available campaign templates
- **CORS**: Configured to accept requests from `http://localhost:3000`

### Frontend Application
The Next.js application uses App Router and is structured as follows:
- Authentication system integrated with Supabase for user management
- Dashboard with multiple features: campaigns, approvals, deployment, templates, analytics, and teams
- Component organization:
  - UI components in `my-app/components/ui/` using shadcn/ui
  - Feature-specific components in respective folders under `my-app/components/`
- Supabase integration configured in `my-app/lib/supabase/` with client, server, and middleware configurations
- Middleware handles session updates for authentication

### Key Dependencies

#### Frontend
- **Authentication & Database**: Supabase (client-side and SSR)
- **UI Components**: Radix UI primitives with shadcn/ui styling
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts for data visualization
- **Styling**: Tailwind CSS with custom configuration

#### Backend
- **Web Framework**: FastAPI with automatic OpenAPI documentation
- **ASGI Server**: Uvicorn for serving the application
- **Validation**: Pydantic for request/response validation
- **Observability**: HoneyHive for monitoring and analytics

### Environment Variables
The application requires Supabase configuration:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Additional Postgres and JWT configuration for backend services