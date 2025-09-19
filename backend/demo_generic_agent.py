#!/usr/bin/env python3
"""
Demo script showing how to use the generic MCP agent with different MCP servers
"""

import asyncio
import logging
from typing import Dict, Any, List
from llamaindex_mcp_agent import GenericMCPAgent

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class MockMCPClient:
    """Mock MCP client for demonstration purposes"""

    def __init__(self, server_name="Mock Server"):
        self.server_name = server_name
        self.mock_tools = [
            {
                "name": "generate_text",
                "description": "Generate text based on a prompt"
            },
            {
                "name": "analyze_sentiment",
                "description": "Analyze the sentiment of given text"
            }
        ]

    async def initialize(self):
        logger.info(f"Connected to {self.server_name}")
        return True

    async def get_server_info(self):
        return {
            "name": self.server_name,
            "version": "1.0.0",
            "capabilities": ["tools", "resources"]
        }

    async def list_tools(self):
        return self.mock_tools

    async def list_resources(self):
        return []

    async def call_tool(self, tool_name: str, arguments: Dict[str, Any]):
        logger.info(f"Mock call to {tool_name} with args: {arguments}")
        return {
            "result": f"Mock result from {tool_name}",
            "arguments_received": arguments
        }

    async def cleanup(self):
        logger.info(f"Mock {self.server_name} cleanup completed")


async def demo_with_mock_client():
    """Demo using a mock MCP client"""
    logger.info("=== Demo with Mock MCP Client ===")

    # Create mock MCP client
    mock_client = MockMCPClient("Demo AI Server")

    # Create generic agent with mock client
    agent = GenericMCPAgent(
        mcp_client=mock_client,
        system_prompt="You are a helpful AI assistant with access to demo tools."
    )

    try:
        # Initialize and discover capabilities
        await agent.initialize()

        # Show discovered capabilities
        capabilities = await agent.get_server_capabilities()
        logger.info(f"Server capabilities: {capabilities}")

        tools = await agent.get_available_tools()
        logger.info(f"Available tools: {tools}")

        # Test tool calling directly
        result = await agent.call_mcp_tool("generate_text", {"prompt": "Hello world"})
        logger.info(f"Direct tool call result: {result}")

        # Note: query() would need a real LLM, so we skip that in this demo
        logger.info("Mock demo completed successfully!")

    except Exception as e:
        logger.error(f"Mock demo failed: {e}")
    finally:
        await agent.cleanup()


async def demo_with_minimax_client():
    """Demo using the MiniMax MCP client (if available)"""
    logger.info("=== Demo with MiniMax MCP Client ===")

    try:
        from mcp_client import MiniMaxMCPClient

        # Create MiniMax MCP client
        minimax_client = MiniMaxMCPClient()

        # Create generic agent with MiniMax client
        agent = GenericMCPAgent(
            mcp_client=minimax_client,
            system_prompt="You are an AI assistant with access to MiniMax multimedia generation tools."
        )

        try:
            # Initialize and discover capabilities
            await agent.initialize()

            # Show discovered capabilities
            capabilities = await agent.get_server_capabilities()
            logger.info(f"MiniMax server capabilities: {capabilities}")

            tools = await agent.get_available_tools()
            logger.info(f"MiniMax available tools: {tools}")

            logger.info("MiniMax demo completed successfully!")

        except Exception as e:
            logger.error(f"MiniMax demo failed: {e}")
        finally:
            await agent.cleanup()

    except ImportError:
        logger.warning("MiniMax client not available for demo")


async def main():
    """Run all demos"""
    logger.info("Starting Generic MCP Agent Demos...")

    # Demo 1: Mock client
    await demo_with_mock_client()

    print("\n" + "="*60 + "\n")

    # Demo 2: MiniMax client (if available)
    await demo_with_minimax_client()

    logger.info("\nAll demos completed!")


if __name__ == "__main__":
    asyncio.run(main())