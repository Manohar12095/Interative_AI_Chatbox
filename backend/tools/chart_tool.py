"""
Chart Generator Tool — generates visual chart URLs using QuickChart.io API.
Returns an image URL that renders as an inline chart in the chat.
"""
import json
import urllib.parse
import requests
from pydantic import BaseModel, Field
from langchain_core.tools import tool


class ChartInput(BaseModel):
    chart_type: str = Field(
        description="Type of chart: 'bar', 'horizontalBar', 'line', 'pie', 'doughnut', 'radar', 'polarArea', or 'scatter'."
    )
    title: str = Field(description="Title displayed at the top of the chart.")
    labels: list[str] = Field(description="List of category labels (X-axis or pie segments).")
    datasets: list[dict] = Field(
        description="List of dataset objects. Each must have 'label' (str) and 'data' (list of numbers). "
                    "Example: [{'label': 'Sales', 'data': [120, 200, 150]}]"
    )


CHART_COLORS = [
    "rgba(0, 198, 255, 0.8)",
    "rgba(123, 47, 255, 0.8)",
    "rgba(255, 99, 132, 0.8)",
    "rgba(255, 159, 64, 0.8)",
    "rgba(75, 192, 192, 0.8)",
    "rgba(255, 205, 86, 0.8)",
    "rgba(54, 162, 235, 0.8)",
    "rgba(153, 102, 255, 0.8)",
]

CHART_BORDERS = [c.replace("0.8)", "1)") for c in CHART_COLORS]


@tool("generate_chart", args_schema=ChartInput)
def generate_chart(chart_type: str, title: str, labels: list[str], datasets: list[dict]) -> str:
    """
    Generate a visual chart (bar, line, pie, radar, doughnut, etc.) from data and return a URL to display it.
    Use this tool when the user wants to visualize data, compare numbers, or see a graph/chart/plot.
    Returns a JSON payload that the frontend renders as an inline image.
    """
    try:
        # Assign colors to datasets
        colored_datasets = []
        for i, ds in enumerate(datasets):
            color = CHART_COLORS[i % len(CHART_COLORS)]
            border = CHART_BORDERS[i % len(CHART_BORDERS)]
            colored_ds = {
                "label": ds.get("label", f"Dataset {i+1}"),
                "data": ds.get("data", []),
                "backgroundColor": color if chart_type in ("pie", "doughnut", "polarArea", "radar") else color,
                "borderColor": border,
                "borderWidth": 2,
                "fill": chart_type in ("line",),
            }
            colored_datasets.append(colored_ds)

        config = {
            "type": chart_type,
            "data": {
                "labels": labels,
                "datasets": colored_datasets,
            },
            "options": {
                "plugins": {
                    "title": {
                        "display": True,
                        "text": title,
                        "color": "#ffffff",
                        "font": {"size": 16, "weight": "bold"},
                    },
                    "legend": {"labels": {"color": "#cccccc"}},
                },
                "scales": {
                    "x": {"ticks": {"color": "#cccccc"}, "grid": {"color": "rgba(255,255,255,0.1)"}},
                    "y": {"ticks": {"color": "#cccccc"}, "grid": {"color": "rgba(255,255,255,0.1)"}},
                } if chart_type not in ("pie", "doughnut", "polarArea", "radar") else {},
                "backgroundColor": "#1a1a2e",
            },
        }

        chart_json = json.dumps(config)
        encoded = urllib.parse.quote(chart_json)
        chart_url = f"https://quickchart.io/chart?c={encoded}&backgroundColor=%231a1a2e&width=600&height=400"

        # Validate URL is reachable
        try:
            check = requests.head(chart_url, timeout=8)
        except Exception:
            check = None

        return json.dumps({
            "type": "chart",
            "url": chart_url,
            "title": title,
            "text": f"📊 Here's your **{title}** chart! The chart shows {', '.join([d['label'] for d in datasets])} across {len(labels)} categories."
        })

    except Exception as e:
        return json.dumps({"type": "error", "text": f"Chart generation failed: {str(e)}"})
