"""
app/state.py
────────────
Shared LangGraph state — exactly matches the Colab notebook GraphState.
"""
from typing import TypedDict, Annotated
from operator import add
from langchain_core.messages import BaseMessage


class GraphState(TypedDict):
    # ── Input ──────────────────────────────────────────────────
    user_input:           str
    file_path:            str
    has_file:             bool

    # ── Memory (accumulates via add) ───────────────────────────
    chat_history:         Annotated[list[BaseMessage], add]

    # ── Routing ────────────────────────────────────────────────
    route:                str

    # ── RAG + Reviewer ─────────────────────────────────────────
    rag_answer:           str
    rag_context:          list
    reviewer_verdict:     str
    reviewer_output:      dict

    # ── Other nodes ────────────────────────────────────────────
    guide_answer:         str
    feedback_output:      str
    player_output:        dict

    # ── Final ──────────────────────────────────────────────────
    final_answer:         str
    error:                str