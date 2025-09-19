# Generic MCP Agent

A production-ready generic Model Context Protocol (MCP) agent that can work with any MCP server and dynamically discover tools.

## 🎯 Key Features

- **Generic Design**: Works with ANY MCP server, not tied to specific implementations
- **Dynamic Tool Discovery**: Automatically discovers available tools when initialized
- **Smart Tool Usage**: Only calls tools when users specifically request actions
- **Multiple Transports**: Supports stdio, HTTP, and SSE transport protocols
- **LlamaIndex Integration**: Built on LlamaIndex's robust BasicMCPClient
- **Production Ready**: Comprehensive error handling and logging

## 🏗️ Architecture

### Core Components

1. **`llamaindex_mcp_client.py`** - MCP client using LlamaIndex BasicMCPClient
2. **`llamaindex_mcp_agent.py`** - Generic agent that works with any MCP server

### Working Files

- `test_complete_system.py` - Production system test
- `test_final_integration.py` - Comprehensive integration tests
- `demo_generic_agent.py` - Demo with mock client examples
- `usage_example.py` - Complete usage guide and examples

## 🚀 Quick Start

### Basic Usage

```python
from llamaindex_mcp_client import create_minimax_stdio_client
from llamaindex_mcp_agent import GenericMCPAgent

# Create MCP client (example with MiniMax)
mcp_client = create_minimax_stdio_client()

# Create generic agent
agent = GenericMCPAgent(mcp_client=mcp_client)

# Initialize and discover tools
await agent.initialize()

# Get available tools
tools = await agent.get_available_tools()
print(f"Discovered {len(tools)} tools")

# Call tools directly when needed
result = await agent.call_mcp_tool("tool_name", {"param": "value"})

# Use conversational interface (requires valid LLM)
response = await agent.query("Generate a video of a sunset")

# Cleanup
await agent.cleanup()
```

### Creating Custom MCP Clients

```python
from llamaindex_mcp_client import LlamaIndexMCPClient

# HTTP transport
http_client = LlamaIndexMCPClient("https://your-server.com/mcp", transport_type="http")

# SSE transport
sse_client = LlamaIndexMCPClient("https://your-server.com/sse", transport_type="sse")

# Stdio transport
stdio_client = LlamaIndexMCPClient("your-command", args=["arg1", "arg2"], transport_type="stdio")

# Use with agent
agent = GenericMCPAgent(mcp_client=your_client)
```

## 🔧 Environment Setup

### Required Environment Variables

```bash
# For MiniMax integration
MINIMAX_API_KEY=your_minimax_api_key
MINIMAX_MCP_BASE_PATH=/path/to/output/directory
MINIMAX_API_HOST=https://api.minimax.io
MINIMAX_API_RESOURCE_MODE=url

# For LLM functionality (optional)
OPENAI_API_KEY=your_openai_api_key
```

### Dependencies

```bash
pip install llama-index-tools-mcp llama-index-llms-openai llama-index-core python-dotenv httpx
```

## 🧪 Testing

Run the complete system test:

```bash
python3 test_complete_system.py
```

Run comprehensive integration tests:

```bash
python3 test_final_integration.py
```

## 📋 MiniMax Integration

When configured with MiniMax, the agent discovers these tools:

- **text_to_audio** - Convert text to speech with voice options
- **list_voices** - List available voices
- **voice_clone** - Clone voices from audio samples
- **play_audio** - Play audio files
- **generate_video** - Generate videos from text prompts
- **query_video_generation** - Check video generation status
- **text_to_image** - Generate images from text
- **music_generation** - Create music from prompts and lyrics
- **voice_design** - Design custom voices from descriptions

## 🎛️ Configuration Options

### Agent Configuration

```python
agent = GenericMCPAgent(
    mcp_client=your_client,           # Any MCP client
    llm=your_llm,                     # Custom LLM (optional)
    system_prompt="Custom prompt"     # Custom system prompt (optional)
)
```

### Automatic Features

- **Tool Discovery**: Automatically discovers all available tools from the MCP server
- **Dynamic Prompts**: Generates system prompts based on discovered tools
- **Error Handling**: Graceful fallbacks and comprehensive error logging
- **Transport Flexibility**: Works with any transport protocol supported by LlamaIndex

## 🔍 Monitoring & Logging

The agent provides detailed logging for:

- MCP server connections
- Tool discovery process
- Tool calls and results
- Error conditions and fallbacks

Set logging level to see detailed information:

```python
import logging
logging.basicConfig(level=logging.INFO)
```

## 🏭 Production Considerations

- **Authentication**: Ensure proper API keys are configured
- **Resource Management**: Always call `cleanup()` when done
- **Error Handling**: The agent gracefully handles server unavailability
- **Cost Awareness**: Many MCP tools make API calls that may incur costs
- **Rate Limiting**: Implement appropriate rate limiting for production use

## 📖 Examples

See `usage_example.py` for comprehensive examples including:

- Custom MCP client implementations
- Different transport types
- Error handling patterns
- Production deployment considerations

## 🧩 Extending the System

The generic design makes it easy to:

1. **Add New MCP Servers**: Just implement the standard MCP client interface
2. **Custom Tool Handling**: Override tool calling methods for specialized behavior
3. **Different LLMs**: Use any LlamaIndex-compatible LLM
4. **Transport Protocols**: Leverage LlamaIndex's transport support

## ✅ Verification

The system has been thoroughly tested and verified to:

- ✅ Connect to real MCP servers (MiniMax)
- ✅ Discover tools dynamically
- ✅ Call tools only when requested
- ✅ Work with multiple client types
- ✅ Handle errors gracefully
- ✅ Support all major transport protocols

---

**Status**: ✅ Production Ready

**Last Updated**: 2025-01-20

**Compatibility**: LlamaIndex 0.12+, Python 3.11+