import os
import asyncio
import logging
from typing import Dict, Any, List, Optional
from dotenv import load_dotenv

from llama_index.tools.mcp import BasicMCPClient

load_dotenv()

logger = logging.getLogger(__name__)


class LlamaIndexMCPClient:
    """
    MCP client using LlamaIndex's BasicMCPClient
    Supports streamable HTTP, SSE, and stdio transports
    """

    def __init__(self,
                 url_or_command: str,
                 args: Optional[List[str]] = None,
                 env: Optional[Dict[str, str]] = None,
                 transport_type: str = "http"):
        """
        Initialize MCP client

        Args:
            url_or_command: URL for HTTP/SSE transport or command for stdio
            args: Arguments for stdio transport
            env: Environment variables for stdio transport
            transport_type: "http", "sse", or "stdio"
        """
        self.url_or_command = url_or_command
        self.args = args or []
        self.env = env or {}
        self.transport_type = transport_type
        self.client = None

    async def initialize(self):
        """Initialize the MCP connection"""
        try:
            if self.transport_type in ["http", "sse"]:
                # HTTP or SSE transport
                self.client = BasicMCPClient(self.url_or_command)
            else:
                # stdio transport
                self.client = BasicMCPClient(
                    self.url_or_command,
                    args=self.args,
                    env=self.env
                )

            logger.info(f"Successfully created MCP client: {self.transport_type}")
            return True

        except Exception as e:
            logger.error(f"Failed to create MCP client: {str(e)}")
            return False

    async def get_server_info(self) -> Dict[str, Any]:
        """Get information about the MCP server"""
        if not self.client:
            return {"error": "No active client"}

        try:
            # Get tools to test connection and get info
            tools_result = await self.client.list_tools()
            resources_result = await self.client.list_resources()
            prompts_result = await self.client.list_prompts()

            # Handle different result formats
            tools = getattr(tools_result, 'tools', tools_result) if tools_result else []
            resources = getattr(resources_result, 'resources', resources_result) if resources_result else []
            prompts = getattr(prompts_result, 'prompts', prompts_result) if prompts_result else []

            return {
                "transport_type": self.transport_type,
                "url_or_command": self.url_or_command,
                "num_tools": len(tools) if tools else 0,
                "num_resources": len(resources) if resources else 0,
                "num_prompts": len(prompts) if prompts else 0,
                "tools": [getattr(tool, 'name', str(tool)) for tool in tools] if tools else [],
                "connection_status": "active"
            }
        except Exception as e:
            logger.error(f"Error getting server info: {str(e)}")
            return {"error": str(e)}

    async def list_tools(self) -> List[Dict[str, Any]]:
        """List available tools from MCP server"""
        if not self.client:
            return []

        try:
            tools_result = await self.client.list_tools()

            # Handle different result formats - could be a result object or list
            tools = getattr(tools_result, 'tools', tools_result) if tools_result else []

            tool_list = []

            for tool in tools:
                if hasattr(tool, 'name'):
                    tool_info = {
                        "name": tool.name,
                        "description": getattr(tool, 'description', f"MCP tool: {tool.name}")
                    }

                    # Add input schema if available
                    if hasattr(tool, 'inputSchema') and tool.inputSchema:
                        tool_info["inputSchema"] = tool.inputSchema
                else:
                    # Handle tuple or other formats
                    tool_info = {
                        "name": str(tool),
                        "description": f"MCP tool: {tool}"
                    }

                tool_list.append(tool_info)

            return tool_list

        except Exception as e:
            logger.error(f"Error listing tools: {str(e)}")
            return []

    async def list_resources(self) -> List[Dict[str, Any]]:
        """List available resources from MCP server"""
        if not self.client:
            return []

        try:
            resources_result = await self.client.list_resources()

            # Handle different result formats
            resources = getattr(resources_result, 'resources', resources_result) if resources_result else []

            resource_list = []

            for resource in resources:
                if hasattr(resource, 'uri'):
                    resource_info = {
                        "uri": resource.uri,
                        "name": getattr(resource, 'name', resource.uri),
                        "description": getattr(resource, 'description', ''),
                        "mimeType": getattr(resource, 'mimeType', None)
                    }
                else:
                    # Handle tuple or other formats
                    resource_info = {
                        "uri": str(resource),
                        "name": str(resource),
                        "description": '',
                        "mimeType": None
                    }
                resource_list.append(resource_info)

            return resource_list

        except Exception as e:
            logger.error(f"Error listing resources: {str(e)}")
            return []

    async def list_prompts(self) -> List[Dict[str, Any]]:
        """List available prompts from MCP server"""
        if not self.client:
            return []

        try:
            prompts_result = await self.client.list_prompts()

            # Handle different result formats
            prompts = getattr(prompts_result, 'prompts', prompts_result) if prompts_result else []

            prompt_list = []

            for prompt in prompts:
                if hasattr(prompt, 'name'):
                    prompt_info = {
                        "name": prompt.name,
                        "description": getattr(prompt, 'description', f"MCP prompt: {prompt.name}"),
                        "arguments": getattr(prompt, 'arguments', [])
                    }
                else:
                    # Handle tuple or other formats
                    prompt_info = {
                        "name": str(prompt),
                        "description": f"MCP prompt: {prompt}",
                        "arguments": []
                    }
                prompt_list.append(prompt_info)

            return prompt_list

        except Exception as e:
            logger.error(f"Error listing prompts: {str(e)}")
            return []

    async def call_tool(self, tool_name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Call a specific tool via MCP"""
        if not self.client:
            return {"error": "No active client"}

        try:
            logger.info(f"Calling MCP tool '{tool_name}' with arguments: {arguments}")
            result = await self.client.call_tool(tool_name, arguments)

            # Convert result to dictionary format
            return {
                "success": True,
                "result": result,
                "tool_name": tool_name
            }

        except Exception as e:
            logger.error(f"Error calling tool {tool_name}: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "tool_name": tool_name
            }

    async def read_resource(self, resource_uri: str) -> Dict[str, Any]:
        """Read a specific resource from MCP server"""
        if not self.client:
            return {"error": "No active client"}

        try:
            content, mime_type = await self.client.read_resource(resource_uri)
            return {
                "success": True,
                "content": content,
                "mime_type": mime_type,
                "resource_uri": resource_uri
            }

        except Exception as e:
            logger.error(f"Error reading resource {resource_uri}: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "resource_uri": resource_uri
            }

    async def get_prompt(self, prompt_name: str, arguments: Dict[str, Any] = None) -> Dict[str, Any]:
        """Get a prompt from MCP server"""
        if not self.client:
            return {"error": "No active client"}

        try:
            result = await self.client.get_prompt(prompt_name, arguments or {})
            return {
                "success": True,
                "result": result,
                "prompt_name": prompt_name
            }

        except Exception as e:
            logger.error(f"Error getting prompt {prompt_name}: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "prompt_name": prompt_name
            }

    async def cleanup(self):
        """Cleanup the MCP client"""
        try:
            if self.client:
                # BasicMCPClient may not have explicit cleanup
                logger.info("MCP client cleanup completed")
        except Exception as e:
            logger.error(f"Error during cleanup: {str(e)}")

    async def __aenter__(self):
        """Async context manager entry"""
        await self.initialize()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        await self.cleanup()


# Convenience functions for different transports

def create_http_client(url: str) -> LlamaIndexMCPClient:
    """Create an HTTP MCP client"""
    return LlamaIndexMCPClient(url, transport_type="http")


def create_sse_client(url: str) -> LlamaIndexMCPClient:
    """Create a Server-Sent Events MCP client"""
    return LlamaIndexMCPClient(url, transport_type="sse")


def create_stdio_client(command: str, args: List[str], env: Dict[str, str] = None) -> LlamaIndexMCPClient:
    """Create a stdio MCP client"""
    return LlamaIndexMCPClient(command, args=args, env=env, transport_type="stdio")


def create_minimax_stdio_client() -> LlamaIndexMCPClient:
    """Create a MiniMax MCP client using stdio (same as Claude Desktop)"""
    return create_stdio_client(
        command="uvx",
        args=["minimax-mcp", "-y"],
        env={
            "MINIMAX_API_KEY": os.getenv("MINIMAX_API_KEY"),
            "MINIMAX_MCP_BASE_PATH": os.getenv("MINIMAX_MCP_BASE_PATH", "/tmp/minimax_output"),
            "MINIMAX_API_HOST": os.getenv("MINIMAX_API_HOST", "https://api.minimax.io"),
            "MINIMAX_API_RESOURCE_MODE": os.getenv("MINIMAX_API_RESOURCE_MODE", "url")
        }
    )


# Example usage
async def test_minimax_llamaindex():
    """Test function to demonstrate LlamaIndex MCP client usage"""
    async with create_minimax_stdio_client() as client:
        # Get server info
        info = await client.get_server_info()
        print("Server Info:", info)

        # List available tools
        tools = await client.list_tools()
        print("Available Tools:", tools)

        # List available resources
        resources = await client.list_resources()
        print("Available Resources:", resources)

        # List available prompts
        prompts = await client.list_prompts()
        print("Available Prompts:", prompts)

        # Example tool call (if tools are available)
        if tools:
            tool_name = tools[0].get("name")
            print(f"Testing tool: {tool_name}")
            result = await client.call_tool(tool_name, {})
            print(f"Tool {tool_name} result:", result)


if __name__ == "__main__":
    asyncio.run(test_minimax_llamaindex())