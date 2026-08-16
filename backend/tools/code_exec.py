"""
Python Code Execution (Sandbox) Tool — runs Python code in a local subprocess
with a timeout and restricted environment. Returns stdout, stderr, and the result.
"""
import subprocess
import sys
import json
import tempfile
import os
from pydantic import BaseModel, Field
from langchain_core.tools import tool

EXEC_TIMEOUT = 15  # Max seconds a script can run


class CodeExecInput(BaseModel):
    code: str = Field(description="The Python code to execute. Must be valid Python 3 code.")
    description: str = Field(
        default="",
        description="A brief description of what this code is doing (e.g. 'Calculate compound interest')."
    )


@tool("run_python", args_schema=CodeExecInput)
def run_python(code: str, description: str = "") -> str:
    """
    Execute Python code in a secure local sandbox and return the output.
    Use this to: solve complex math, analyze data, generate calculations, process text algorithmically,
    run simulations, or answer 'what is X formula applied to Y values' type questions.
    Provide clean, runnable Python 3 code using only standard library modules or pre-installed packages
    (numpy, pandas, sympy, requests, json, math, datetime, collections, itertools, statistics).
    Always print() the final result so it appears in the output.
    """
    # Basic safety check: block dangerous operations
    BLOCKED = [
        "import os", "import sys", "import subprocess", "import shutil",
        "__import__", "open(", "exec(", "eval(", "compile(", "importlib",
        "socket", "urllib", "http.server", "ftplib", "smtplib", "pickle",
        "ctypes", "multiprocessing", "threading", "os.system", "os.popen",
    ]
    code_lower = code.lower()
    for blocked in BLOCKED:
        if blocked.lower() in code_lower:
            return json.dumps({
                "type": "code_result",
                "stdout": "",
                "stderr": f"Blocked: '{blocked}' is not allowed in the sandbox for security reasons.",
                "error": True,
                "description": description or "Code execution"
            })

    # Write code to a temp file and run it in a subprocess
    try:
        with tempfile.NamedTemporaryFile(mode="w", suffix=".py", delete=False, encoding="utf-8") as f:
            f.write(code)
            tmp_path = f.name

        result = subprocess.run(
            [sys.executable, tmp_path],
            capture_output=True,
            text=True,
            timeout=EXEC_TIMEOUT,
            cwd=tempfile.gettempdir(),
            env={
                "PATH": os.environ.get("PATH", ""),
                "PYTHONPATH": "",
                "HOME": tempfile.gettempdir(),
            }
        )

        os.unlink(tmp_path)

        stdout = result.stdout.strip()
        stderr = result.stderr.strip()
        has_error = result.returncode != 0

        return json.dumps({
            "type": "code_result",
            "description": description or "Python code execution",
            "code": code,
            "stdout": stdout or "(no output)",
            "stderr": stderr if has_error else "",
            "error": has_error,
            "text": (
                f"**Code executed successfully!**\n\n```\n{stdout}\n```"
                if not has_error
                else f"**Code ran with errors:**\n\n```\n{stderr}\n```"
            )
        })

    except subprocess.TimeoutExpired:
        try:
            os.unlink(tmp_path)
        except Exception:
            pass
        return json.dumps({
            "type": "code_result",
            "stdout": "",
            "stderr": f"Timeout: Code took longer than {EXEC_TIMEOUT} seconds to run.",
            "error": True,
            "text": f"⏰ Code execution timed out after {EXEC_TIMEOUT} seconds."
        })
    except Exception as e:
        return json.dumps({
            "type": "code_result",
            "stdout": "",
            "stderr": str(e),
            "error": True,
            "text": f"Execution error: {str(e)}"
        })
