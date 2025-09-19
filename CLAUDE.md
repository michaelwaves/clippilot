# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This is a full-stack ClipPilot application with:
- **Frontend**: Next.js 15 app with TypeScript, Tailwind CSS 4, and shadcn/ui components
- **Backend**: FastAPI server with LlamaIndex MCP agent integration for AI-powered functionality

## Common Commands

### Frontend (frontend/)
```bash
cd frontend
npm run dev        # Start development server on localhost:3000 with Turbopack
npm run build      # Build production bundle with Turbopack
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
The FastAPI backend (`backend/main.py`) provides REST API endpoints:
- **Health Check**: `GET /health` - API health status
- **Campaigns**:
  - `GET /api/campaigns` - List all campaigns
  - `POST /api/campaigns` - Create new campaign
- **Analytics**: `GET /api/analytics/overview` - Analytics dashboard data
- **Templates**: `GET /api/templates` - Available campaign templates
- **AI Chat System**:
  - `POST /api/chat/stream` - Streaming chat with LlamaIndex MCP agent
  - `POST /api/chat/reset/{conversation_id}` - Reset conversation
  - `GET /api/chat/tools/{conversation_id}` - Get available tools
  - `POST /api/agent/query` - Direct agent query
  - `GET /api/agent/status` - Agent health status
- **CORS**: Configured to accept requests from `http://localhost:3000`

The backend integrates with a **LlamaIndex MCP Agent** (`llamaindex_mcp_agent.py`) that provides:
- Generic MCP (Model Context Protocol) client integration
- OpenAI LLM integration with streaming responses
- Tool discovery and execution capabilities
- Conversation management with persistent agent instances

### Frontend Application
The Next.js 15 application (`frontend/`) uses App Router with:
- **Authentication**: Stytch integration for user management
- **Database**: PostgreSQL with Kysely query builder
- **Dashboard Structure**:
  - `/dashboard` - Main dashboard layout
  - `/dashboard/campaigns` - Campaign management
  - `/dashboard/assets` - Asset management
  - `/dashboard/members` - Team member management
  - `/dashboard/organization` - Organization settings
  - `/authenticate` - Authentication pages
- **Component Organization**:
  - UI components in `frontend/components/ui/` using shadcn/ui (New York style)
  - Global navigation in `frontend/components/GlobalNavBar.tsx`
  - Authentication components for login/signup flows

### Key Dependencies

#### Frontend
- **Framework**: Next.js 15 with React 19
- **Authentication**: Stytch for modern authentication flows
- **Database**: PostgreSQL with Kysely query builder and codegen
- **UI Components**: Radix UI primitives with shadcn/ui (New York variant)
- **Icons**: Lucide React icon library
- **Styling**: Tailwind CSS 4 with PostCSS
- **Development**: Turbopack for fast builds and development

#### Backend
- **Web Framework**: FastAPI with automatic OpenAPI documentation
- **AI/ML**: LlamaIndex with OpenAI integration
- **Agent Framework**: Custom MCP agent with tool discovery
- **Monitoring**: HoneyHive for observability and tracing
- **Streaming**: Server-sent events for real-time chat
- **ASGI Server**: Uvicorn for serving the application
- **Validation**: Pydantic for request/response validation

### Environment Variables
The application requires:
- **Backend**: `OPENAI_API_KEY` for LlamaIndex agent functionality
- **Frontend**: Stytch configuration for authentication
- **Database**: PostgreSQL connection configuration