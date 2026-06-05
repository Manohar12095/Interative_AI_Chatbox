"""
Tools route — list available tools.
"""
from fastapi import APIRouter
from tools import TOOL_METADATA

router = APIRouter()


@router.get("/tools")
async def list_tools():
    return TOOL_METADATA
