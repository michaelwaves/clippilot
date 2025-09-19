# MiniMax MCP Agent Integration

This backend provides a streaming chat interface that connects to a MiniMax MCP server using a simplified LlamaIndex-style agent.

## Features

- **MCP Client**: Connects to a MiniMax MCP server via HTTP
- **Streaming Chat**: Real-time token streaming from the agent to the frontend
- **Tool Discovery**: Automatically discovers and uses tools exposed by the MCP server
- **Conversation Management**: Maintains conversation history and state

## Setup

1. Install dependencies:
```bash
pip install fastapi uvicorn httpx sse-starlette python-dotenv
```

2. Set up environment variables in `.env`:
```bash
MINIMAX_MCP_SERVER_URL=http://localhost:8001
```

3. Start your MiniMax MCP server on the configured port (default: 8001)

4. Run the FastAPI backend:
```bash
python3 main.py
```

## API Endpoints

### Chat Streaming
- **POST** `/api/chat/stream`
  - Streams chat responses in real-time
  - Request body: `{"message": "Hello", "conversation_id": "optional", "system_prompt": "optional"}`
  - Returns: Server-Sent Events (SSE) stream

### Conversation Management
- **POST** `/api/chat/reset/{conversation_id}` - Reset conversation history
- **GET** `/api/chat/tools/{conversation_id}` - Get available MCP tools

## MCP Server Requirements

Your MiniMax MCP server should expose these endpoints:

- `GET /tools` - List available tools
- `POST /tools/{tool_name}` - Execute a specific tool
- `POST /chat/completions` - Stream chat completions (OpenAI-compatible)

## Frontend Integration

The chat interface is available at `/chat` in the Next.js frontend and connects to the streaming endpoint automatically.

## Architecture

```
Frontend (Next.js) → FastAPI Backend → MiniMax MCP Server
     ↑                    ↑                    ↑
   WebSocket/SSE      HTTP Streaming      Tool Execution
```

The system uses:
1. **SimpleLlamaAgent**: Manages conversation and tool calling
2. **MiniMaxMCPClient**: Handles MCP server communication
3. **Streaming Response**: Real-time token delivery to frontend
