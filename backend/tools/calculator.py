from pydantic import BaseModel, Field
import math
import sympy as sp
from langchain_core.tools import tool

class CalculatorSchema(BaseModel):
    expression: str = Field(..., description="The expression for the calculator tool")

@tool(args_schema=CalculatorSchema)
def calculator(expression: str) -> str:
    """
    Evaluate math expressions, algebra, calculus, statistics.
    Examples: '2+2', 'sqrt(144)', 'integrate(x**2, x)', 'solve(x**2 - 4, x)'
    """
    try:
        if any(kw in expression for kw in ['integrate', 'solve', 'diff', 'limit', 'simplify', 'expand']):
            x, y, z = sp.symbols('x y z')
            result = eval(f"sp.{expression}", {"sp": sp, "x": x, "y": y, "z": z})
            return f"Result: {result}"
        safe_env = {k: getattr(math, k) for k in dir(math) if not k.startswith('_')}
        safe_env.update({'abs': abs, 'round': round, 'pow': pow})
        result = eval(expression, {"__builtins__": {}}, safe_env)
        return f"Result: {result}"
    except Exception as e:
        return f"Math error: {e}"
