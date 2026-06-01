# """
# main.py
# ───────
# FastAPI entry point for the ChatBot Backend (port 8001).

# Run:
#     uvicorn main:app --port 8001 --reload
# """
# import os
# from contextlib import asynccontextmanager

# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware

# from app.config import settings
# from app.api.chat import router as chat_router


# # ── Startup / shutdown lifecycle ──────────────────────────────────
# @asynccontextmanager
# async def lifespan(app: FastAPI):
#     """
#     Runs on startup:  validate config + pre-warm the graph
#     Runs on shutdown: cleanup (nothing to do with MemorySaver)
#     """
#     # ── Validate env vars ─────────────────────────────────────
#     settings.validate()
#     print("✅ Config validated")

#     # ── Pre-compile LangGraph (loads models) ──────────────────
#     print("⏳ Pre-compiling LangGraph graph...")
#     from app.graph import get_graph
#     get_graph()
#     print("✅ LangGraph graph ready")

#     # ── Create upload directory ───────────────────────────────
#     os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
#     print(f"✅ Upload dir: {settings.UPLOAD_DIR}")

#     print("\n🚀 ChatBot Backend running on port 8001\n")
#     yield
#     print("\n⏹️  ChatBot Backend shutting down...")


# # ── FastAPI app ───────────────────────────────────────────────────
# app = FastAPI(
#     title        = "SportsMed AI — Chatbot Backend",
#     description  = "Multi-agent LangGraph chatbot: Medical RAG, Guide, CV Feedback",
#     version      = "1.0.0",
#     lifespan     = lifespan,
#     docs_url     = "/docs",
#     redoc_url    = "/redoc",
# )

# # ── CORS — allow React frontend on port 3000 ─────────────────────
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=[
#         "http://localhost:3000",
#         "http://localhost:5173",   # Vite dev server
#         "http://127.0.0.1:3000",
#         "http://127.0.0.1:5173",
#     ],
#     allow_credentials = True,
#     allow_methods     = ["*"],
#     allow_headers     = ["*"],
# )

# # ── Register routers ──────────────────────────────────────────────
# app.include_router(chat_router)


# # ── Health check ──────────────────────────────────────────────────
# @app.get("/health", tags=["health"])
# async def health():
#     return {
#         "status":  "ok",
#         "service": "chatbot_backend",
#         "port":    8001,
#         "agents":  ["medical_rag", "guide", "feedback", "player_analysis"],
#     }


# # ── Root ──────────────────────────────────────────────────────────
# @app.get("/", tags=["root"])
# async def root():
#     return {
#         "message": "SportsMed AI Chatbot Backend",
#         "docs":    "http://localhost:8001/docs",
#         "health":  "http://localhost:8001/health",
#     }



# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from dotenv import load_dotenv

load_dotenv()

from app.config import settings
from app.api import chat

app = FastAPI(
    title="SportsMed AI Chatbot",
    description="Multi-Agent Chatbot Backend (Port 8001)",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(chat.router, prefix="/api", tags=["Chat"])

@app.get("/")
async def root():
    return {
        "message": "SportsMed AI Chatbot API is running on port 8001",
        "status": "active"
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)