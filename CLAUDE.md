# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This is a full-stack application with:
- **Frontend**: Next.js 14 app with TypeScript, Tailwind CSS, and shadcn/ui components
- **Backend**: Python backend using HoneyHive (currently minimal implementation)

## Common Commands

### Frontend (my-app/)
```bash
cd my-app
npm run dev        # Start development server on localhost:3000
npm run build      # Build production bundle
npm run lint       # Run ESLint
npm start          # Run production server
```

### Backend
```bash
cd backend
python main.py     # Run the backend application
```

## Architecture Overview

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
- **Authentication & Database**: Supabase (client-side and SSR)
- **UI Components**: Radix UI primitives with shadcn/ui styling
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts for data visualization
- **Styling**: Tailwind CSS with custom configuration

### Environment Variables
The application requires Supabase configuration:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Additional Postgres and JWT configuration for backend services