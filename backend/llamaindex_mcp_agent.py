import os
import asyncio
import json
from typing import List, Dict, Any, AsyncGenerator, Optional
from dotenv import load_dotenv

from llama_index.llms.openai import OpenAI
from llama_index.core.agent import ReActAgent
from llama_index.core.tools import BaseTool, FunctionTool
from llama_index.core.callbacks import CallbackManager
import logging

load_dotenv()

logger = logging.getLogger(__name__)


class GenericMCPAgent:
    def __init__(self, mcp_client=None, llm=None, system_prompt: Optional[str] = None):
        """
        Generic MCP agent that can work with any MCP server

        Args:
            mcp_client: Any MCP client that implements the standard interface
            llm: LlamaIndex LLM instance (defaults to OpenAI if API key available)
            system_prompt: Custom system prompt for the agent
        """
        self.tools = []
        self.agent = None
        self.mcp_client = mcp_client
        self.discovered_tools = []
        self.server_info = {}

        # LLM configuration
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        self.custom_llm = llm
        self.custom_system_prompt = system_prompt

        # Initialize default MCP client if none provided
        if self.mcp_client is None:
            # Try to import and use LlamaIndex MCP client as default
            try:
                from llamaindex_mcp_client import create_minimax_stdio_client
                self.mcp_client = create_minimax_stdio_client()
                logger.info("Using LlamaIndex MiniMax MCP client as default")
            except ImportError:
                logger.warning("No MCP client provided and LlamaIndex MCP client not available")

    async def discover_server_capabilities(self):
        """Discover what the MCP server can do"""
        if not self.mcp_client:
            raise ValueError("No MCP client available")

        try:
            # Initialize the MCP client connection
            await self.mcp_client.initialize()
            logger.info("Connected to MCP server")

            # Get server information
            self.server_info = await self.mcp_client.get_server_info()
            logger.info(f"Server info: {self.server_info}")

            # Discover available tools
            self.discovered_tools = await self.mcp_client.list_tools()
            logger.info(f"Discovered {len(self.discovered_tools)} tools: {[tool.get('name') for tool in self.discovered_tools]}")

            # Discover available resources
            resources = await self.mcp_client.list_resources()
            logger.info(f"Discovered {len(resources)} resources")

            return {
                "server_info": self.server_info,
                "tools": self.discovered_tools,
                "resources": resources
            }

        except Exception as e:
            logger.error(f"Failed to discover server capabilities: {str(e)}")
            return {"error": str(e)}

    async def initialize(self):
        """Initialize the MCP connection and prepare the agent"""
        try:
            if not self.mcp_client:
                raise ValueError("No MCP client available for initialization")

            # Discover server capabilities
            capabilities = await self.discover_server_capabilities()

            if "error" in capabilities:
                logger.warning(f"Failed to discover capabilities: {capabilities['error']}")
                # Continue with empty tools
                self.discovered_tools = []

            # Convert discovered tools to LlamaIndex FunctionTool objects
            self.tools = []
            for tool_info in self.discovered_tools:
                tool_name = tool_info.get('name')
                tool_description = tool_info.get('description', f"MCP tool: {tool_name}")

                # Create a function that calls the MCP tool - fix closure issue
                def make_tool_wrapper(name):
                    async def call_mcp_tool_wrapper(**kwargs):
                        """Wrapper function to call MCP tool with arguments"""
                        logger.info(f"Calling MCP tool '{name}' with args: {kwargs}")
                        result = await self.mcp_client.call_tool(name, kwargs)
                        logger.info(f"Tool '{name}' result: {result}")
                        return result
                    return call_mcp_tool_wrapper

                # Create LlamaIndex FunctionTool
                llama_tool = FunctionTool.from_defaults(
                    fn=make_tool_wrapper(tool_name),
                    name=tool_name,
                    description=tool_description
                )
                self.tools.append(llama_tool)

            logger.info(f"Prepared {len(self.tools)} LlamaIndex tools from MCP server")

            # Initialize LLM
            if self.custom_llm:
                llm = self.custom_llm
                logger.info("Using provided custom LLM")
            elif self.openai_api_key:
                llm = OpenAI(
                    api_key=self.openai_api_key,
                    model="gpt-4-turbo-preview",
                    temperature=0.1
                )
                logger.info("Using OpenAI LLM")
            else:
                # Fallback to a basic configuration
                llm = OpenAI(
                    api_key="dummy-key",  # This will fail but shows the pattern
                    model="gpt-3.5-turbo",
                    temperature=0.1
                )
                logger.warning("No LLM provided or OpenAI API key found, using dummy configuration")

            # Create dynamic system prompt based on discovered tools
            if self.custom_system_prompt:
                system_prompt = self.custom_system_prompt
            else:
                if self.tools:
                    tool_descriptions = []
                    for tool in self.tools:
                        tool_descriptions.append(f"- {tool.metadata.name}: {tool.metadata.description}")

                    system_prompt = f"""You are an AI assistant with access to MCP (Model Context Protocol) tools.

Available tools:
{chr(10).join(tool_descriptions)}

You can help users by:
1. Understanding their requests
2. Using the appropriate tools when needed
3. Providing helpful responses based on tool results

Only call tools when the user specifically requests an action that requires them. Be helpful and informative."""
                else:
                    system_prompt = """You are an AI assistant. Currently, no MCP tools are available, but I can still help with general questions and conversations."""

            # Create ReAct agent with discovered tools
            self.agent = ReActAgent(
                tools=self.tools,
                llm=llm,
                verbose=True,
                max_iterations=10,
                system_prompt=system_prompt
            )

            logger.info("Generic MCP agent initialized successfully")

        except Exception as e:
            logger.error(f"Failed to initialize MCP agent: {str(e)}")
            # Fallback: create agent without MCP tools
            if self.custom_llm or self.openai_api_key:
                llm = self.custom_llm or OpenAI(api_key=self.openai_api_key, model="gpt-3.5-turbo")
                self.agent = ReActAgent(tools=[], llm=llm, verbose=True)
                logger.info("Initialized fallback agent without MCP tools")
            else:
                raise e

    async def stream_response(self, message: str, system_prompt: str = None) -> AsyncGenerator[str, None]:
        """Stream response from the agent"""
        if not self.agent:
            await self.initialize()

        try:
            # Prepare the full prompt
            full_prompt = message
            if system_prompt:
                full_prompt = f"System: {system_prompt}\n\nUser: {message}"

            # Stream the response
            response = await self.agent.astream_chat(full_prompt)

            async for token in response.async_response_gen():
                yield token

        except Exception as e:
            logger.error(f"Error in stream_response: {str(e)}")
            yield f"Error: {str(e)}"

    async def get_server_capabilities(self) -> Dict[str, Any]:
        """Get comprehensive information about the MCP server"""
        if not self.mcp_client:
            return {"error": "No MCP client available"}

        try:
            return await self.discover_server_capabilities()
        except Exception as e:
            logger.error(f"Error getting server capabilities: {str(e)}")
            return {"error": str(e)}

    async def get_available_tools(self) -> List[Dict[str, Any]]:
        """Get list of available tools from MCP server"""
        return self.discovered_tools

    async def call_mcp_tool(self, tool_name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Call a specific MCP tool directly (only when requested by user)"""
        if not self.mcp_client:
            return {
                "success": False,
                "error": "No MCP client available",
                "tool_name": tool_name
            }

        # Verify the tool exists
        if tool_name not in [tool.get('name') for tool in self.discovered_tools]:
            return {
                "success": False,
                "error": f"Tool '{tool_name}' not found in discovered tools",
                "tool_name": tool_name
            }

        try:
            logger.info(f"User requested to call MCP tool '{tool_name}' with arguments: {arguments}")
            result = await self.mcp_client.call_tool(tool_name, arguments)
            return {
                "success": True,
                "result": result,
                "tool_name": tool_name
            }
        except Exception as e:
            logger.error(f"Error calling MCP tool {tool_name}: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "tool_name": tool_name
            }

    async def query(self, message: str) -> str:
        """
        Process a user query and return a response.
        Tools are only called if the user request requires them.
        """
        if not self.agent:
            await self.initialize()

        try:
            logger.info(f"Processing user query: {message}")
            # Use the correct method for ReActAgent
            response = self.agent.chat(message)
            return str(response)
        except Exception as e:
            logger.error(f"Error processing query: {str(e)}")
            return f"Error: {str(e)}"

    async def cleanup(self):
        """Cleanup resources"""
        try:
            if self.mcp_client:
                await self.mcp_client.cleanup()
                logger.info("MCP client cleaned up")
            logger.info("MCP agent cleanup completed")
        except Exception as e:
            logger.error(f"Error during cleanup: {str(e)}")


