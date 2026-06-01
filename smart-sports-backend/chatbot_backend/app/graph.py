"""
app/graph.py
────────────
Builds and compiles the LangGraph multi-agent graph.
The compiled graph is a singleton — imported once at startup.

Graph topology:
  START → supervisor
    ├→ medical_rag → reviewer → END
    ├→ guide                  → END
    ├→ feedback               → END
    └→ player_analysis        → END   (disabled — returns placeholder)
"""
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
from langchain_core.messages import AIMessage

from app.state import GraphState
from app.nodes.supervisor import supervisor_node, route_to_agent
from app.nodes.medical_rag import medical_rag_node
from app.nodes.reviewer import reviewer_node
from app.nodes.guide import guide_node
from app.nodes.feedback import feedback_node
from app.nodes.kaggle_gpu_node import analyze_video_on_kaggle
import plotly.graph_objects as go
from plotly.subplots import make_subplots


# ── Placeholder for disabled player_analysis node ────────────────
def build_spider_json(player_output: dict) -> str:
    categories  = player_output.get("categories", [])
    scores      = player_output.get("scores", [])
    fifa        = player_output.get("fifa_stats", {})
    med         = player_output.get("medical_report", {})
    player_name = player_output.get("player_name", "Player")
    position    = player_output.get("position", "—")


    categories_plot = categories + [categories[0]]
    scores_plot     = scores + [scores[0]]
    overall         = round(sum(scores) / len(scores), 1)
    health          = med.get("Health_Score", 0)
    status          = med.get("Status", "—")

    def score_color(s):
        if s >= 85: return "#00FF88"
        if s >= 70: return "#FFD700"
        if s >= 55: return "#FF8C00"
        return "#FF4444"

    fig = make_subplots(
        rows=1, cols=2,
        specs=[[{"type": "polar"}, {"type": "table"}]],
        column_widths=[0.6, 0.4],
    )

    fig.add_trace(
        go.Scatterpolar(
            r             = scores_plot,
            theta         = categories_plot,
            fill          = "toself",
            fillcolor     = "rgba(0,255,136,0.25)",
            line          = dict(color="#00FF88", width=3),
            marker        = dict(size=8, color=[score_color(s) for s in scores_plot]),
            name          = player_name,
            hovertemplate = "<b>%{theta}</b><br>Score: %{r}<extra></extra>",
        ),
        row=1, col=1
    )

    fig.add_trace(
        go.Table(
            header=dict(
                values     = ["<b>Attribute</b>", "<b>Value</b>"],
                fill_color = "#0d0d2e",
                font       = dict(color="white", size=13),
                align      = "center",
                height     = 32,
            ),
            cells=dict(
                values=[
                    ["🏃 Position","⭐️ Overall","⚡️ Pace","🏃 Stamina",
                     "💪 Physical","🏥 Health","😴 Sleep","🔥 Soreness","📋 Status"],
                    [position, f"{overall}/100",
                     f"{fifa.get('PAC','—')}/99",
                     f"{fifa.get('STA','—')}/99",
                     f"{fifa.get('PHY','—')}/99",
                     f"{health}/100",
                     f"{med.get('Sleep_Quality',0)}/10",
                     f"{med.get('Soreness_Level',0)}/10",
                     status]
                ],
                fill_color=[
                    ["#0d0d1a"] * 9,
                    ["#0d0d1a","#0d0d1a",
                     score_color(fifa.get("PAC",0)),
                     score_color(fifa.get("STA",0)),
                     score_color(fifa.get("PHY",0)),
                     score_color(health),
                     "#0d0d1a","#0d0d1a",
                     score_color(health)]
                ],
                font   = dict(color=["#aaaaaa","white"], size=12),
                align  = ["left","center"],
                height = 30,
            )
        ),
        row=1, col=2
    )

    fig.update_layout(
        title=dict(
            text=f"<b>{player_name.upper()}</b> · {position} · Overall: <span style='color:#FFD700'>{overall}</span>",
            font=dict(size=20, color="white"),
            x=0.5,
        ),
        polar=dict(
            radialaxis=dict(
                visible=True, range=[0,100],
                gridcolor="rgba(255,255,255,0.1)",
                tickfont=dict(color="rgba(255,255,255,0.5)", size=10),
                tickvals=[20,40,60,80,100],
            ),
            angularaxis=dict(
                gridcolor="rgba(255,255,255,0.1)",
                tickfont=dict(color="white", size=13),
            ),
            bgcolor="rgb(13,13,30)",
        ),
        paper_bgcolor = "rgb(13,13,26)",
        plot_bgcolor  = "rgb(13,13,26)",
        showlegend    = False,
        height        = 650,
        margin        = dict(t=80, b=20, l=40, r=40),
    )

    return fig.to_json()


def player_analysis_node(state: GraphState) -> dict:
    video_path = state.get("file_path", "")
    user_input = state.get("user_input", "")

    if not video_path:
        msg = "⚠️ Please upload a video file to analyze."
        return {
            "player_output": {},
            "final_answer":  msg,
            "chat_history":  [AIMessage(content=msg)],
        }

    import re
    match = re.search(r"player:(\w+)", user_input, re.IGNORECASE)
    player_name = match.group(1) if match else ""
    print(f"🔍 user_input: {user_input}")
    print(f"🔍 player_name extracted: {player_name}")

    action, score, extra = analyze_video_on_kaggle(video_path, player_name)
    player_stats    = extra.get("player_stats", {})
    scouting_report = extra.get("scouting_report", "")
    market_value    = extra.get("market_value", {})

    if not player_stats:
        player_stats = {
            "player_name": player_name or "Player",
            "position":    "Unknown",
            "categories":  ["Pace","Stamina","Physicality","Health","Technical"],
            "scores":      [70, 75, 80, 85, round(score * 10)],
            "fifa_stats":  {"PAC": 70, "STA": 75, "PHY": 80},
            "medical_report": {
                "Health_Score":   85,
                "Status":         "Fit to Play",
                "Sleep_Quality":  8,
                "Soreness_Level": 3,
            },
        }

    spider_json = build_spider_json(player_stats)

    msg = f"✅ Action: **{action.upper()}** | Quality: **{score}/10**\n\n{scouting_report}"

    return {
        "player_output": {
            **player_stats,
            "spider_chart":    spider_json,
            "scouting_report": scouting_report,
            "market_value":    market_value,
        },
        "final_answer":  msg,
        "chat_history":  [AIMessage(content=msg)],
    }


def _build_graph() -> tuple:
    """Build and compile the graph. Returns (graph, builder)."""
    print("🔨 Building LangGraph multi-agent graph...")

    memory  = MemorySaver()
    builder = StateGraph(GraphState)

    # ── Add all nodes ─────────────────────────────────────────
    builder.add_node("supervisor",      supervisor_node)
    builder.add_node("medical_rag",     medical_rag_node)
    builder.add_node("reviewer",        reviewer_node)
    builder.add_node("guide",           guide_node)
    builder.add_node("feedback",        feedback_node)
    builder.add_node("player_analysis", player_analysis_node)

    # ── Entry point ───────────────────────────────────────────
    builder.set_entry_point("supervisor")

    # ── Supervisor → conditional routing ─────────────────────
    builder.add_conditional_edges(
        "supervisor",
        route_to_agent,
        {
            "medical_rag":     "medical_rag",
            "guide":           "guide",
            "feedback":        "feedback",
            "player_analysis": "player_analysis",
        }
    )

    # ── Medical RAG → Reviewer → END ─────────────────────────
    builder.add_edge("medical_rag", "reviewer")
    builder.add_edge("reviewer",    END)

    # ── All others → END directly ────────────────────────────
    builder.add_edge("guide",           END)
    builder.add_edge("feedback",        END)
    builder.add_edge("player_analysis", END)

    graph = builder.compile(checkpointer=memory)

    print("✅ Graph compiled with MemorySaver.")
    print("""
  START → supervisor
    ├→ medical_rag → reviewer → END
    ├→ guide                  → END
    ├→ feedback               → END
    └→ player_analysis        → END
""")
    return graph, builder, memory


# ── Module-level singleton ────────────────────────────────────────
graph, _builder, _memory = _build_graph()


def get_graph():
    """Return the compiled graph (singleton)."""
    return graph


def reset_graph():
    """
    Recompile the graph with fresh MemorySaver.
    Call this only if you need to wipe ALL sessions.
    """
    global graph, _builder, _memory
    graph, _builder, _memory = _build_graph()
    return graph