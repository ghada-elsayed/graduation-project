# """
# app/api/chat.py
# ───────────────
# FastAPI router — exposes the chatbot endpoints.

# Endpoints:
#   POST   /chat              → send message, get response
#   DELETE /chat/{thread_id}  → clear session (returns confirmation)
#   GET    /chat/{thread_id}/history → get conversation history
# """
# import os
# import uuid
# import aiofiles
# from typing import Optional

# from fastapi import APIRouter, UploadFile, File, Form, HTTPException
# from fastapi.responses import JSONResponse
# from pydantic import BaseModel

# from app.config import settings
# from app.graph import get_graph

# router = APIRouter(prefix="/chat", tags=["chat"])

# MAX_HISTORY = settings.MAX_HISTORY
# UPLOAD_DIR  = settings.UPLOAD_DIR
# os.makedirs(UPLOAD_DIR, exist_ok=True)


# # ── Request / Response schemas ────────────────────────────────────
# class ChatRequest(BaseModel):
#     message:   str
#     thread_id: Optional[str] = None   # If None → new session


# class ChatResponse(BaseModel):
#     status:       str          # "success" | "error"
#     thread_id:    str
#     route:        str          # which agent handled it
#     final_answer: str
#     reviewer:     dict         # { verdict, score } or nulls
#     player_data:  Optional[dict] = None
#     error:        Optional[str]  = None


# # ── Helper: build initial state ───────────────────────────────────
# def _build_initial_state(
#     user_input: str,
#     file_path:  str  = "",
#     has_file:   bool = False,
# ) -> dict:
#     return {
#         "user_input":       user_input,
#         "file_path":        file_path,
#         "has_file":         has_file,
#         "chat_history":     [],
#         "route":            "",
#         "rag_answer":       "",
#         "rag_context":      [],
#         "reviewer_verdict": "",
#         "reviewer_output":  {},
#         "guide_answer":     "",
#         "feedback_output":  "",
#         "player_output":    {},
#         "final_answer":     "",
#         "error":            "",
#     }


# # ── Helper: run graph ─────────────────────────────────────────────
# def _invoke_graph(
#     user_input: str,
#     thread_id:  str,
#     file_path:  str  = "",
#     has_file:   bool = False,
# ) -> dict:
#     g      = get_graph()
#     config = {"configurable": {"thread_id": thread_id}}

#     # Log history size before invoke
#     try:
#         current = g.get_state(config)
#         history = current.values.get("chat_history", [])
#         if len(history) > MAX_HISTORY:
#             print(f"   🧹 History: {len(history)} messages (limit: {MAX_HISTORY})")
#     except Exception:
#         pass

#     result = g.invoke(
#         _build_initial_state(user_input, file_path, has_file),
#         config=config,
#     )

#     return {
#         "status":       "success" if not result.get("error") else "error",
#         "thread_id":    thread_id,
#         "route":        result.get("route", ""),
#         "final_answer": result.get("final_answer", ""),
#         "reviewer": {
#             "verdict": result.get("reviewer_verdict") or None,
#             "score":   result.get("reviewer_output", {}).get("score") or None,
#         },
#         "player_data": result.get("player_output") or None,
#         "error":       result.get("error") or None,
#     }


# # ══════════════════════════════════════════════════════════════════
# #  ENDPOINT 1 — Text-only chat (JSON body)
# # ══════════════════════════════════════════════════════════════════
# @router.post("", response_model=ChatResponse)
# async def chat(body: ChatRequest):
#     """
#     Send a text message to the chatbot.

#     - **message**: user's question or command
#     - **thread_id**: session ID (auto-generated if not provided)
#     """
#     thread_id = body.thread_id or str(uuid.uuid4())

#     try:
#         response = _invoke_graph(
#             user_input = body.message,
#             thread_id  = thread_id,
#         )
#         return response

#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))


# # ══════════════════════════════════════════════════════════════════
# #  ENDPOINT 2 — Chat with file upload (multipart form)
# # ══════════════════════════════════════════════════════════════════
# @router.post("/upload", response_model=ChatResponse)
# async def chat_with_file(
#     message:   str        = Form(...),
#     thread_id: str        = Form(None),
#     file:      UploadFile = File(None),
# ):
#     """
#     Send a message with an optional file upload (CV, PDF).

#     Use this endpoint when the user attaches a file.
#     The file is saved temporarily, analyzed, then deleted.
#     """
#     thread_id  = thread_id or str(uuid.uuid4())
#     saved_path = ""
#     has_file   = False

#     # ── Save uploaded file ────────────────────────────────────
#     if file and file.filename:
#         ext        = os.path.splitext(file.filename)[1].lower()
#         safe_name  = f"{thread_id}_{uuid.uuid4().hex[:8]}{ext}"
#         saved_path = os.path.join(UPLOAD_DIR, safe_name)

#         async with aiofiles.open(saved_path, "wb") as f:
#             content = await file.read()
#             await f.write(content)

#         has_file = True
#         print(f"   📎 File saved: {saved_path} ({len(content)} bytes)")

#     try:
#         response = _invoke_graph(
#             user_input = message,
#             thread_id  = thread_id,
#             file_path  = saved_path,
#             has_file   = has_file,
#         )
#         return response

#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

#     finally:
#         # ── Clean up temp file after processing ──────────────
#         if saved_path and os.path.exists(saved_path):
#             os.remove(saved_path)
#             print(f"   🗑️  Temp file deleted: {saved_path}")


# # ══════════════════════════════════════════════════════════════════
# #  ENDPOINT 3 — Get conversation history
# # ══════════════════════════════════════════════════════════════════
# @router.get("/{thread_id}/history")
# async def get_history(thread_id: str):
#     """
#     Return the conversation history for a session.
#     """
#     from langchain_core.messages import HumanMessage, AIMessage

#     try:
#         g       = get_graph()
#         config  = {"configurable": {"thread_id": thread_id}}
#         state   = g.get_state(config)
#         history = state.values.get("chat_history", [])

#         turns = []
#         i = 0
#         while i < len(history):
#             msg = history[i]
#             if isinstance(msg, HumanMessage):
#                 user_text = msg.content
#                 ai_text   = ""
#                 if i + 1 < len(history) and isinstance(history[i + 1], AIMessage):
#                     ai_text = history[i + 1].content
#                     i += 2
#                 else:
#                     i += 1
#                 turns.append({"role": "user",      "content": user_text})
#                 if ai_text:
#                     turns.append({"role": "assistant", "content": ai_text})
#             else:
#                 i += 1

#         return {
#             "thread_id":      thread_id,
#             "message_count":  len(history),
#             "turn_count":     len([t for t in turns if t["role"] == "user"]),
#             "last_route":     state.values.get("route", ""),
#             "messages":       turns,
#         }

#     except Exception as e:
#         raise HTTPException(status_code=404, detail=f"Session not found: {str(e)}")


# # ══════════════════════════════════════════════════════════════════
# #  ENDPOINT 4 — Clear session memory
# # ══════════════════════════════════════════════════════════════════
# @router.delete("/{thread_id}")
# async def clear_session(thread_id: str):
#     """
#     Clear the memory for a session (start fresh).
#     Note: MemorySaver doesn't support deletion — this returns a
#     confirmation and the frontend should use a new thread_id instead.
#     """
#     new_id = str(uuid.uuid4())
#     return JSONResponse({
#         "message":        "Session cleared. Use the new thread_id for a fresh conversation.",
#         "old_thread_id":  thread_id,
#         "new_thread_id":  new_id,
#     })





"""
app/api/chat.py
───────────────
FastAPI router — exposes the chatbot endpoints.

Endpoints:
  POST   /chat              → send message, get response
  DELETE /chat/{thread_id}  → clear session (returns confirmation)
  GET    /chat/{thread_id}/history → get conversation history
"""
import os
import uuid
import aiofiles
from typing import Optional

from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from app.config import settings
from app.graph import get_graph

router = APIRouter(prefix="/chat", tags=["chat"])

MAX_HISTORY = getattr(settings, "MAX_HISTORY", 20)
UPLOAD_DIR  = getattr(settings, "UPLOAD_DIR", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ── Request / Response schemas ────────────────────────────────────
class ChatRequest(BaseModel):
    message:   str
    thread_id: Optional[str] = None   # If None → new session


class ChatResponse(BaseModel):
    status:       str          # "success" | "error"
    thread_id:    str
    route:        str          # which agent handled it
    final_answer: str
    reviewer:     dict         # { verdict, score } or nulls
    player_data:  Optional[dict] = None
    error:        Optional[str]  = None


# ── Helper: build initial state ───────────────────────────────────
def _build_initial_state(
    user_input: str,
    file_path:  str  = "",
    has_file:   bool = False,
) -> dict:
    return {
        "user_input":       user_input,
        "file_path":        file_path,
        "has_file":         has_file,
        "chat_history":     [],
        "route":            "",
        "rag_answer":       "",
        "rag_context":      [],
        "reviewer_verdict": "",
        "reviewer_output":  {},
        "guide_answer":     "",
        "feedback_output":  "",
        "player_output":    {},
        "final_answer":     "",
        "error":            "",
    }


# ── Helper: run graph ─────────────────────────────────────────────
def _invoke_graph(
    user_input: str,
    thread_id:  str,
    file_path:  str  = "",
    has_file:   bool = False,
) -> dict:
    g      = get_graph()
    config = {"configurable": {"thread_id": thread_id}}

    # ====================== Memory Trimming ======================
    try:
        current = g.get_state(config)
        history = current.values.get("chat_history", [])
        if len(history) > MAX_HISTORY:
            print(f"🧹 Trimming memory: {len(history)} → {MAX_HISTORY} messages")
            # يمكنك إضافة trim logic أقوى هنا لو حابة
    except Exception:
        pass

    # ====================== Invoke Graph ======================
    initial_state = _build_initial_state(user_input, file_path, has_file)

    result = g.invoke(initial_state, config=config)

    # ====================== Clean Response ======================
    return {
        "status":       "success" if not result.get("error") else "error",
        "thread_id":    thread_id,
        "route":        result.get("route", ""),
        "final_answer": result.get("final_answer", ""),
        "reviewer": {
            "verdict": result.get("reviewer_verdict") or None,
            "score":   result.get("reviewer_output", {}).get("score") or None,
        },
        "player_data": result.get("player_output") or None,
        "error":       result.get("error") or None,
    }

# ══════════════════════════════════════════════════════════════════
#  ENDPOINT 1 — Text-only chat (JSON body)
# ══════════════════════════════════════════════════════════════════
@router.post("", response_model=ChatResponse)
async def chat(body: ChatRequest):
    """
    Send a text message to the chatbot.

    - **message**: user's question or command
    - **thread_id**: session ID (auto-generated if not provided)
    """
    thread_id = body.thread_id or str(uuid.uuid4())

    try:
        response = _invoke_graph(
            user_input = body.message,
            thread_id  = thread_id,
        )
        return response

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ══════════════════════════════════════════════════════════════════
#  ENDPOINT 2 — Chat with file upload (multipart form)
# ══════════════════════════════════════════════════════════════════
@router.post("/upload", response_model=ChatResponse)
async def chat_with_file(
    message:   str        = Form(...),
    thread_id: str        = Form(None),
    file:      UploadFile = File(None),
):
    """
    Send a message with an optional file upload (CV, PDF).

    Use this endpoint when the user attaches a file.
    The file is saved temporarily, analyzed, then deleted.
    """
    thread_id  = thread_id or str(uuid.uuid4())
    saved_path = ""
    has_file   = False

    # ── Save uploaded file ────────────────────────────────────
    if file and file.filename:
        ext        = os.path.splitext(file.filename)[1].lower()
        safe_name  = f"{thread_id}_{uuid.uuid4().hex[:8]}{ext}"
        saved_path = os.path.join(UPLOAD_DIR, safe_name)

        async with aiofiles.open(saved_path, "wb") as f:
            content = await file.read()
            await f.write(content)

        has_file = True
        print(f"   📎 File saved: {saved_path} ({len(content)} bytes)")

    try:
        response = _invoke_graph(
            user_input = message,
            thread_id  = thread_id,
            file_path  = saved_path,
            has_file   = has_file,
        )
        return response

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        # ── Clean up temp file after processing ──────────────
        if saved_path and os.path.exists(saved_path):
            os.remove(saved_path)
            print(f"   🗑️  Temp file deleted: {saved_path}")


# ══════════════════════════════════════════════════════════════════
#  ENDPOINT 3 — Get conversation history
# ══════════════════════════════════════════════════════════════════
@router.get("/{thread_id}/history")
async def get_history(thread_id: str):
    """
    Return the conversation history for a session.
    """
    from langchain_core.messages import HumanMessage, AIMessage

    try:
        g       = get_graph()
        config  = {"configurable": {"thread_id": thread_id}}
        state   = g.get_state(config)
        history = state.values.get("chat_history", [])

        turns = []
        i = 0
        while i < len(history):
            msg = history[i]
            if isinstance(msg, HumanMessage):
                user_text = msg.content
                ai_text   = ""
                if i + 1 < len(history) and isinstance(history[i + 1], AIMessage):
                    ai_text = history[i + 1].content
                    i += 2
                else:
                    i += 1
                turns.append({"role": "user",      "content": user_text})
                if ai_text:
                    turns.append({"role": "assistant", "content": ai_text})
            else:
                i += 1

        return {
            "thread_id":      thread_id,
            "message_count":  len(history),
            "turn_count":     len([t for t in turns if t["role"] == "user"]),
            "last_route":     state.values.get("route", ""),
            "messages":       turns,
        }

    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Session not found: {str(e)}")


# ══════════════════════════════════════════════════════════════════
#  ENDPOINT 4 — Clear session memory
# ══════════════════════════════════════════════════════════════════
@router.delete("/{thread_id}")
async def clear_session(thread_id: str):
    """
    Clear the memory for a session (start fresh).
    Note: MemorySaver doesn't support deletion — this returns a
    confirmation and the frontend should use a new thread_id instead.
    """
    new_id = str(uuid.uuid4())
    return JSONResponse({
        "message":        "Session cleared. Use the new thread_id for a fresh conversation.",
        "old_thread_id":  thread_id,
        "new_thread_id":  new_id,
    })