from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import uvicorn

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


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )