from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import uvicorn
import asyncio
import json
from llamaindex_mcp_agent import GenericMCPAgent

app = FastAPI(
    title="ClipPilot API",
    description="Backend API for ClipPilot application",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class HealthResponse(BaseModel):
    status: str
    message: str


class CampaignRequest(BaseModel):
    name: str
    description: Optional[str] = None
    target_audience: Optional[str] = None
    budget: Optional[float] = None


class CampaignResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    target_audience: Optional[str] = None
    budget: Optional[float] = None
    status: str
    created_at: str


class ChatRequest(BaseModel):
    message: str
    system_prompt: Optional[str] = "You are a helpful AI assistant."
    conversation_id: Optional[str] = None


class QueryRequest(BaseModel):
    message: str
    system_prompt: Optional[str] = None


agent_instances = {}


@app.get("/")
def root():
    return {"message": "Welcome to ClipPilot API"}


@app.get("/health", response_model=HealthResponse)
def health_check():
    return HealthResponse(
        status="healthy",
        message="API is running successfully"
    )


@app.post("/api/campaigns", response_model=CampaignResponse)
def create_campaign(campaign: CampaignRequest):
    import uuid
    from datetime import datetime
    
    return CampaignResponse(
        id=str(uuid.uuid4()),
        name=campaign.name,
        description=campaign.description,
        target_audience=campaign.target_audience,
        budget=campaign.budget,
        status="draft",
        created_at=datetime.now().isoformat()
    )


@app.get("/api/campaigns")
def get_campaigns():
    return {
        "campaigns": [
            {
                "id": "1",
                "name": "Sample Campaign",
                "status": "active",
                "created_at": "2025-01-19T12:00:00"
            }
        ]
    }


@app.get("/api/analytics/overview")
def get_analytics_overview():
    return {
        "total_campaigns": 5,
        "active_campaigns": 3,
        "total_impressions": 150000,
        "total_clicks": 4500,
        "conversion_rate": 3.2
    }


@app.get("/api/templates")
def get_templates():
    return {
        "templates": [
            {
                "id": "1",
                "name": "Product Launch",
                "category": "Marketing",
                "description": "Template for product launch campaigns"
            },
            {
                "id": "2", 
                "name": "Holiday Sale",
                "category": "Sales",
                "description": "Template for holiday sale promotions"
            }
        ]
    }


@app.post("/api/chat/stream")
async def stream_chat(request: ChatRequest):
    import uuid
    
    conversation_id = request.conversation_id or str(uuid.uuid4())
    
    if conversation_id not in agent_instances:
        agent = GenericMCPAgent()
        await agent.initialize()
        agent_instances[conversation_id] = {
            "agent": agent
        }
    
    agent = agent_instances[conversation_id]["agent"]
    
    async def generate():
        try:
            async for chunk in agent.stream_response(
                request.message,
                request.system_prompt
            ):
                yield f"data: {json.dumps({'content': chunk, 'conversation_id': conversation_id})}\n\n"
            yield "data: [DONE]\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
    
    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Conversation-ID": conversation_id
        }
    )


@app.post("/api/chat/reset/{conversation_id}")
async def reset_conversation(conversation_id: str):
    if conversation_id in agent_instances:
        # Reset by reinitializing the agent
        agent = GenericMCPAgent()
        await agent.initialize()
        agent_instances[conversation_id] = {"agent": agent}
        return {"message": "Conversation reset successfully"}
    return {"message": "Conversation not found"}


@app.get("/api/chat/tools/{conversation_id}")
async def get_available_tools(conversation_id: str):
    if conversation_id not in agent_instances:
        agent = GenericMCPAgent()
        await agent.initialize()
        agent_instances[conversation_id] = {
            "agent": agent
        }

    agent = agent_instances[conversation_id]["agent"]
    tools = await agent.get_available_tools()
    return {"tools": tools}


@app.post("/api/agent/query")
async def query_agent(request: QueryRequest):
    """
    Query the LlamaIndex agent with a message and get a complete response.
    This is a simple, non-streaming endpoint for direct queries.

    Note: Requires proper LlamaIndex setup with OpenAI API key or other LLM configuration.
    """
    import uuid

    # Create a temporary agent instance for this query
    agent = GenericMCPAgent(system_prompt=request.system_prompt)

    try:
        await agent.initialize()
        response = await agent.query(request.message)

        return {
            "response": response,
            "status": "success",
            "message": "Query processed successfully"
        }

    except Exception as e:
        # Provide helpful error information
        error_message = str(e)
        if "openai" in error_message.lower() or "api" in error_message.lower():
            error_message += ". Please ensure OpenAI API key is configured in .env file."

        return {
            "response": f"Agent configuration error: {error_message}",
            "status": "error",
            "message": "Check LlamaIndex agent setup and dependencies"
        }

    finally:
        # Clean up the agent
        try:
            await agent.cleanup()
        except:
            pass


@app.get("/api/agent/status")
async def get_agent_status():
    """
    Check the status of the LlamaIndex agent configuration.
    """
    try:
        agent = GenericMCPAgent()
        await agent.initialize()

        # Get server capabilities if available
        capabilities = await agent.get_server_capabilities()
        tools = await agent.get_available_tools()

        await agent.cleanup()

        return {
            "status": "healthy",
            "message": "LlamaIndex agent is properly configured",
            "capabilities": capabilities,
            "available_tools": len(tools),
            "tools": tools[:5] if tools else []  # Show first 5 tools
        }

    except Exception as e:
        return {
            "status": "error",
            "message": f"Agent configuration issue: {str(e)}",
            "suggestion": "Check OpenAI API key in .env file and verify LlamaIndex installation"
        }


@app.on_event("shutdown")
async def shutdown_event():
    for instance in agent_instances.values():
        await instance["agent"].cleanup()


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )