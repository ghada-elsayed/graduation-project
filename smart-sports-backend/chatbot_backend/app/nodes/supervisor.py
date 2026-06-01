"""
app/nodes/supervisor.py
───────────────────────
Supervisor LLM — reads user input, routes to the right agent.
"""
from typing import Literal
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import HumanMessage

from app.config import settings
from app.state import GraphState


# ── Supervisor LLM (low tokens — only outputs one word) ──────────
_supervisor_llm = ChatGroq(
    model=settings.GROQ_MODEL,
    api_key=settings.GROQ_API_KEY,
    temperature=0.0,
    max_tokens=20,
)

_supervisor_prompt = ChatPromptTemplate.from_messages([
    ("system", """
You are the Supervisor of SportsMed AI — a multi-agent sports platform.
Read the user message and route to exactly ONE agent.

CONVERSATION HISTORY:
{chat_history}

AGENTS:
  medical_rag     → sports medicine, exercises, muscles, rehab,
                    nutrition, physiology, any fitness question
  guide           → how to use the app, app features,
                    what app can/cannot do, Q&A about the system
  feedback        → user uploads CV/PDF for athletic profile analysis
  player_analysis → video analysis, player card, spider diagram,
                    market value, FIFA stats, scouting report

RULES:
  • CV/PDF/portfolio upload      → feedback
  • Video/player stats request   → player_analysis
  • App usage questions          → guide
  • Medical/fitness questions    → medical_rag
  • Follow-up question           → same agent as previous turn
  • Unclear                      → medical_rag

RESPOND WITH ONLY ONE WORD:
  medical_rag  OR  guide  OR  feedback  OR  player_analysis
"""),
    ("human",
     "User message  : {user_input}\n"
     "File uploaded : {has_file}\n"
     "Route to:"
     ),
])


def _format_history(messages: list, max_exchanges: int = 3) -> str:
    if not messages:
        return "No previous conversation."
    recent = messages[-(max_exchanges * 2):]
    lines = []
    for msg in recent:
        role = "User" if isinstance(msg, HumanMessage) else "Assistant"
        lines.append(f"{role}: {msg.content[:200]}")
    return "\n".join(lines)


# ── Node function ─────────────────────────────────────────────────
def supervisor_node(state: GraphState) -> dict:
    print(f"\n{'━'*60}")
    print(f"🎯 SUPERVISOR")
    print(f"   Input    : {state['user_input']}")
    print(f"   Has file : {state.get('has_file', False)}")
    print(f"   History  : {len(state.get('chat_history', []))} messages")

    chain = _supervisor_prompt | _supervisor_llm
    result = chain.invoke({
        "user_input":   state["user_input"],
        "has_file":     state.get("has_file", False),
        "chat_history": _format_history(state.get("chat_history", [])),
    })

    route = result.content.strip().lower()
    valid = ["medical_rag", "guide", "feedback", "player_analysis"]
    if route not in valid:
        print(f"   ⚠️  Invalid route '{route}' → fallback: medical_rag")
        route = "medical_rag"

    print(f"   ✅ Routed → {route.upper()}")
    print(f"{'━'*60}")

    return {
        "route":        route,
        "chat_history": [HumanMessage(content=state["user_input"])],
    }


# ── Router edge (used as conditional_edges target) ───────────────
def route_to_agent(
    state: GraphState,
) -> Literal["medical_rag", "guide", "feedback", "player_analysis"]:
    route = state.get("route", "medical_rag")
    print(f"   🔀 Router → {route}")
    return route