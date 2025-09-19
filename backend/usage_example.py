#!/usr/bin/env python3
"""
Complete usage example for the Generic MCP Agent

This shows how to:
1. Use the agent with different MCP servers
2. Provide your own LLM
3. Customize the system prompt
4. Call tools only when needed
"""

import asyncio
import logging
from typing import Dict, Any
from llamaindex_mcp_agent import GenericMCPAgent

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# Example 1: Mock MCP client for any server
class CustomMCPClient:
    """Example custom MCP client - replace with your actual MCP client"""

    def __init__(self, server_url: str, api_key: str = None):
        self.server_url = server_url
        self.api_key = api_key
        # Your server's available tools
        self.available_tools = [
            {
                "name": "search_web",
                "description": "Search the web for information"
            },
            {
                "name": "generate_image",
                "description": "Generate an image from text description"
            },
            {
                "name": "translate_text",
                "description": "Translate text between languages"
            }
        ]

    async def initialize(self):
        logger.info(f"Connecting to server at {self.server_url}")
        # Your connection logic here
        return True

    async def get_server_info(self):
        return {
            "name": "Custom AI Server",
            "version": "2.0.0",
            "url": self.server_url
        }

    async def list_tools(self):
        return self.available_tools

    async def list_resources(self):
        return []

    async def call_tool(self, tool_name: str, arguments: Dict[str, Any]):
        logger.info(f"Calling {tool_name} on server with args: {arguments}")
        # Your actual tool calling logic here
        # This would make HTTP requests to your server
        return {
            "success": True,
            "result": f"Result from {tool_name}",
            "data": arguments
        }

    async def cleanup(self):
        logger.info("Custom server connection closed")


# Example 2: Custom LLM (if you don't want to use OpenAI)
class CustomLLM:
    """Example custom LLM - replace with your preferred LLM"""

    def __init__(self, model_name: str = "custom-model"):
        self.model_name = model_name

    def achat(self, message: str):
        # Your LLM implementation here
        # This could be local models, Anthropic, etc.
        logger.info(f"LLM processing: {message}")
        return f"Response from {self.model_name}: {message}"


async def example_usage():
    """Complete example of using the Generic MCP Agent"""

    logger.info("=== Generic MCP Agent Usage Example ===")

    # Step 1: Create your MCP client (replace with your actual client)
    mcp_client = CustomMCPClient(
        server_url="https://your-mcp-server.com/api",
        api_key="your-api-key"
    )

    # Step 2: Optionally create custom LLM (or use OpenAI with OPENAI_API_KEY env var)
    # custom_llm = CustomLLM("your-preferred-model")

    # Step 3: Create the generic agent
    agent = GenericMCPAgent(
        mcp_client=mcp_client,
        # llm=custom_llm,  # Optional: provide your own LLM
        system_prompt="""You are a helpful AI assistant with access to various tools.

Available capabilities:
- Web search
- Image generation
- Text translation

Only use tools when the user specifically requests an action that requires them.
Always explain what you're doing and ask for confirmation before calling tools."""
    )

    try:
        # Step 4: Initialize and discover server capabilities
        await agent.initialize()

        # Step 5: Get information about the server
        capabilities = await agent.get_server_capabilities()
        logger.info(f"Server capabilities: {capabilities}")

        tools = await agent.get_available_tools()
        logger.info(f"Available tools: {len(tools)} tools discovered")
        for tool in tools:
            logger.info(f"  - {tool['name']}: {tool['description']}")

        # Step 6: Example of calling tools directly (when user requests it)
        logger.info("\n--- Example: User requests image generation ---")
        result = await agent.call_mcp_tool("generate_image", {
            "prompt": "A beautiful sunset over mountains",
            "style": "photorealistic"
        })
        logger.info(f"Image generation result: {result}")

        # Step 7: Example of using the conversational agent (requires valid LLM)
        # if agent.agent:
        #     logger.info("\n--- Example: Conversational interaction ---")
        #     response = await agent.query("Can you search for information about renewable energy?")
        #     logger.info(f"Agent response: {response}")

        logger.info("\nExample completed successfully!")

    except Exception as e:
        logger.error(f"Example failed: {e}")
    finally:
        await agent.cleanup()


async def main():
    """Run the usage example"""
    await example_usage()

    print("\n" + "="*60)
    print("HOW TO USE WITH YOUR OWN MCP SERVER:")
    print("="*60)
    print("1. Replace CustomMCPClient with your actual MCP client")
    print("2. Set OPENAI_API_KEY environment variable OR provide custom LLM")
    print("3. Update the system prompt for your specific use case")
    print("4. The agent will automatically discover and use your server's tools")
    print("5. Tools are only called when users specifically request actions")


if __name__ == "__main__":
    asyncio.run(main())