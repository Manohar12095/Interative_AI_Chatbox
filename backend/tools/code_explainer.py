from pydantic import BaseModel, Field
from langchain_core.tools import tool

class ExplainCodeSchema(BaseModel):
    code: str = Field(..., description="The code for the explain_code tool")
    language: str = Field(default="python", description="The language for the explain_code tool")

@tool(args_schema=ExplainCodeSchema)
def explain_code(code: str, language: str = "python") -> str:
    """Explain what a piece of code does, find bugs, or suggest improvements."""
    return f"[CODE_EXPLAIN] Language: {language}\n```{language}\n{code}\n```"
