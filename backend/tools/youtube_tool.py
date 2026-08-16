"""
YouTube Video Summarizer Tool — extracts transcript from a YouTube video
using youtube-transcript-api and returns it so the AI can summarize it.
"""
import re
import json
from pydantic import BaseModel, Field
from langchain_core.tools import tool


class YouTubeInput(BaseModel):
    url: str = Field(description="The YouTube video URL or video ID to get the transcript for.")


def _extract_video_id(url: str) -> str | None:
    """Extract video ID from various YouTube URL formats."""
    patterns = [
        r"(?:v=|youtu\.be/|embed/|shorts/)([a-zA-Z0-9_-]{11})",
        r"^([a-zA-Z0-9_-]{11})$",  # Raw video ID
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return None


@tool("youtube_summarizer", args_schema=YouTubeInput)
def youtube_summarizer(url: str) -> str:
    """
    Get the transcript/subtitles of a YouTube video so it can be summarized or analyzed.
    Use this tool when a user shares a YouTube URL and asks you to summarize, explain, or
    answer questions about the video content. After getting the transcript, provide a
    comprehensive summary with key points, topics covered, and important takeaways.
    """
    try:
        from youtube_transcript_api import YouTubeTranscriptApi, TranscriptsDisabled, NoTranscriptFound
    except ImportError:
        return (
            "Error: The 'youtube-transcript-api' package is not installed. "
            "Please run: pip install youtube-transcript-api"
        )

    video_id = _extract_video_id(url)
    if not video_id:
        return f"Error: Could not extract a valid YouTube video ID from: '{url}'"

    try:
        # Try English first, then auto-generated, then any available
        transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)

        transcript = None
        try:
            transcript = transcript_list.find_manually_created_transcript(["en"])
        except Exception:
            pass

        if not transcript:
            try:
                transcript = transcript_list.find_generated_transcript(["en"])
            except Exception:
                pass

        if not transcript:
            # Grab any available transcript
            for t in transcript_list:
                transcript = t
                break

        if not transcript:
            return f"No transcript available for this video (ID: {video_id})."

        entries = transcript.fetch()
        # Combine all text entries
        full_text = " ".join(entry["text"] for entry in entries)

        # Limit length
        if len(full_text) > 10000:
            full_text = full_text[:10000] + " [Transcript truncated due to length]"

        video_url = f"https://www.youtube.com/watch?v={video_id}"
        return (
            f"**YouTube Video Transcript**\n"
            f"**URL:** {video_url}\n"
            f"**Video ID:** {video_id}\n\n"
            f"---\n\n{full_text}"
        )

    except TranscriptsDisabled:
        return f"Transcripts are disabled for this video (ID: {video_id}). The creator has turned off captions."
    except NoTranscriptFound:
        return f"No transcript found for video ID: {video_id}. This video may not have captions."
    except Exception as e:
        return f"Error fetching transcript: {str(e)}"
