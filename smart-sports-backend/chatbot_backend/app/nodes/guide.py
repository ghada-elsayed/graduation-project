# """
# app/nodes/guide.py
# ──────────────────
# Guide node — explains how to use the SportsMed AI app.

# Replaces: %run NODE_USER_Guide_RAG_SPORT.ipynb

# NOTE: This node uses a simple LLM chain (no RAG).
# If your guide node in Colab also uses Pinecone, replace the
# _guide_llm.invoke() call with a vector store retrieval chain.
# """
# from langchain_groq import ChatGroq
# from langchain_core.prompts import ChatPromptTemplate
# from langchain_core.messages import AIMessage

# from app.config import settings
# from app.state import GraphState


# _guide_llm = ChatGroq(
#     model=settings.GROQ_MODEL,
#     api_key=settings.GROQ_API_KEY,
#     temperature=0.4,
#     max_tokens=768,
# )

# _guide_prompt = ChatPromptTemplate.from_messages([
#     ("system", """
# You are the helpful guide for SportsMed AI — a smart sports platform.

# YOUR JOB:
# Help users understand what the app can do and how to use its features.

# APP FEATURES:
# 1. 🏥 Medical & Sports Q&A
#    → Ask any sports medicine, nutrition, exercise, or rehab question
#    → Powered by RAG from a curated sports medicine knowledge base

# 2. 📄 Athletic Profile / CV Analysis
#    → Upload your CV or profile PDF
#    → Get structured feedback on your athletic background and potential

# 3. 🎮 Player Analysis (Coming Soon)
#    → Upload a video of a player
#    → Get FIFA stats, health score, market value estimate, scouting report

# 4. 💬 Conversational Memory
#    → The chatbot remembers your conversation within a session
#    → Each new login starts a fresh session

# HOW TO USE:
# - Just type your question naturally
# - To analyze a CV: upload the PDF file along with your message
# - For follow-up questions: just continue typing — context is remembered

# LIMITATIONS:
# - Video player analysis is currently in beta
# - The chatbot does not have access to real-time sports news
# - Medical advice is for informational purposes — consult a doctor for diagnosis

# Answer in the same language as the user (Arabic or English).
# Be friendly, clear, and concise.
# """),
#     ("human", "User question: {question}"),
# ])


# # ── Node function ─────────────────────────────────────────────────
# def guide_node(state: GraphState) -> dict:
#     print(f"\n🧭 GUIDE NODE")
#     print(f"   Question: {state['user_input']}")

#     try:
#         chain  = _guide_prompt | _guide_llm
#         result = chain.invoke({"question": state["user_input"]})
#         answer = result.content

#         print(f"   ✅ Guide answered")

#         return {
#             "guide_answer": answer,
#             "final_answer": answer,
#             "chat_history": [AIMessage(content=answer)],
#         }

#     except Exception as e:
#         err = f"Guide node error: {str(e)}"
#         print(f"   ❌ {err}")
#         return {
#             "guide_answer": "",
#             "final_answer": "",
#             "error":        err,
#         }






# # app/nodes/guide.py
# from langchain_groq import ChatGroq
# from langchain_core.prompts import ChatPromptTemplate
# from langchain_huggingface import HuggingFaceEmbeddings
# from langchain_pinecone import PineconeVectorStore
# from langchain_core.runnables import RunnableParallel, RunnablePassthrough
# from langchain_core.output_parsers import StrOutputParser

# embeddings = HuggingFaceEmbeddings(
#     model_name="BAAI/bge-large-en-v1.5",
#     model_kwargs={"device": "cpu"},
# )

# GUIDE_INDEX_NAME = "medical-sport-assistant"

# qa_store = PineconeVectorStore(index_name=GUIDE_INDEX_NAME, embedding=embeddings, namespace="agent_guide_Q&A")
# docs_store = PineconeVectorStore(index_name=GUIDE_INDEX_NAME, embedding=embeddings, namespace="assistant_user_guide")

# qa_retriever = qa_store.as_retriever(search_kwargs={"k": 4, "score_threshold": 0.50})
# docs_retriever = docs_store.as_retriever(search_kwargs={"k": 4, "score_threshold": 0.45})

# def merged_retriever(question: str):
#     seen = set()
#     docs = []
#     for retriever in [qa_retriever, docs_retriever]:
#         for doc in retriever.invoke(question):
#             key = hash(doc.page_content[:100])
#             if key not in seen:
#                 seen.add(key)
#                 docs.append(doc)
#     return docs

# def format_docs(docs):
#     if not docs:
#         return "⚠️ No relevant context retrieved from guide knowledge base."
#     return "\n\n---\n\n".join([doc.page_content for doc in docs])

# guide_llm = ChatGroq(model="llama-3.3-70b-versatile", temperature=0.3, max_tokens=1024)

# guide_system_prompt = """
# You are **SportsMed Guide** — the friendly onboarding assistant for the SportsMed AI application.
# Your job is to help users understand how to use the app, its features, and how to ask better questions.
# Answer only from the retrieved context. Be friendly, clear, and concise.
# """

# guide_prompt = ChatPromptTemplate.from_messages([
#     ("system", guide_system_prompt),
#     ("human", "━━━━━━━━━━━━━━━━━━━━━━━━━\n👤 USER QUESTION:\n{question}\n━━━━━━━━━━━━━━━━━━━━━━━━━"),
# ])

# guide_chain = (
#     RunnableParallel({
#         "context": RunnablePassthrough() | (lambda x: merged_retriever(x["question"])) | format_docs,
#         "question": RunnablePassthrough() | (lambda x: x["question"]),
#     })
#     | guide_prompt
#     | guide_llm
#     | StrOutputParser()
# )

# def ask_guide(question: str):
#     return guide_chain.invoke({"question": question})













"""
app/nodes/guide.py
──────────────────
Exact replica of NODE_USER_Guide_RAG_SPORT.ipynb
Fixed imports for Windows compatibility
"""
from functools import lru_cache

from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_pinecone import PineconeVectorStore
from langchain_core.runnables import RunnablePassthrough, RunnableParallel
from langchain_core.output_parsers import StrOutputParser
from langchain_core.messages import AIMessage

from app.config import settings
from app.state import GraphState

GUIDE_INDEX_NAME = "medical-sport-assistant"


@lru_cache(maxsize=1)
def _get_guide_components():
    print("🔌 Connecting to embeddings & Pinecone Guide Index...")

    embeddings = HuggingFaceEmbeddings(
        model_name="BAAI/bge-large-en-v1.5",
        model_kwargs={"device": "cpu"},
        encode_kwargs={"normalize_embeddings": True},
    )

    qa_store = PineconeVectorStore(
        index_name=GUIDE_INDEX_NAME,
        embedding=embeddings,
        namespace="agent_guide_Q&A",
    )
    docs_store = PineconeVectorStore(
        index_name=GUIDE_INDEX_NAME,
        embedding=embeddings,
        namespace="assistant_user_guide",
    )
    print("✅ Connected to: agent_guide_Q&A + assistant_user_guide")

    qa_retriever = qa_store.as_retriever(
        search_type="similarity_score_threshold",
        search_kwargs={"k": 4, "score_threshold": 0.50},
    )
    docs_retriever = docs_store.as_retriever(
        search_type="similarity_score_threshold",
        search_kwargs={"k": 4, "score_threshold": 0.45},
    )

    guide_llm = ChatGroq(
        model="llama-3.3-70b-versatile",
        api_key=settings.GROQ_API_KEY,
        temperature=0.3,
        max_tokens=1024,
    )

    guide_system_prompt = """
You are **SportsMed Guide** — the friendly, knowledgeable onboarding assistant \
for the SportsMed AI application.

Your ONLY job is to help users understand:
  • What the app does and what it cannot do
  • How to use it effectively
  • What topics and domains it covers
  • How to ask better questions
  • How to interpret the answers they receive

You have access to two knowledge sources retrieved below:
  1. ❓ Q&A Knowledge Base  — pre-written answers to common user questions
  2. 📄 App Documentation   — full project description and feature details

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📚 RETRIEVED GUIDE CONTEXT:
{context}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

══════════════════════════════════════════
              GUIDE RULES
══════════════════════════════════════════

▸ RULE 1 — SOURCE STRICT
  Answer ONLY from the retrieved context above.
  Never invent features, capabilities, or instructions
  that are not described in the documentation.

▸ RULE 2 — COVERAGE HANDLING

  ✅ FOUND IN CONTEXT
     Answer clearly, friendly, and structured.

  ⚠️ PARTIALLY FOUND
     Answer what you can, then say:
     "For more details on [specific topic], I recommend
      checking with the app support team."

  ❌ NOT FOUND
     Respond ONLY with:
     "I don't have specific documentation on that yet.
      Try asking about how to use the app, what topics
      it covers, or how to phrase your questions."

▸ RULE 3 — TONE
  • Friendly, clear, and encouraging — not clinical
  • Use simple language — not technical jargon
  • Be concise — users want quick guidance
  • Use examples wherever helpful

▸ RULE 4 — NEVER DO THIS
  • Never answer medical or fitness questions directly
  • Never give training advice or nutrition advice
  • If user asks a medical question → redirect:
    "That sounds like a great question for the
     SportsMed AI assistant! Try asking it in
     the main chat. 💪"

▸ RULE 5 — RESPONSE FORMAT

## 🏷️ [Short clear title]

### Answer
[Direct, friendly answer from context]

### 💡 Tip  ← only when helpful
[Practical suggestion to use the app better]

### 📝 Example  ← only when an example helps
[Show exactly what to type]
"""

    guide_prompt = ChatPromptTemplate.from_messages([
        ("system", guide_system_prompt),
        ("human",
         "━━━━━━━━━━━━━━━━━━━━━━━━━\n"
         "👤 USER QUESTION:\n{question}\n"
         "━━━━━━━━━━━━━━━━━━━━━━━━━\n"
         "Check both knowledge bases and give a clear, friendly response."
         ),
    ])

    def merged_retriever(question: str) -> list:
        seen = set()
        docs = []
        for retriever in [qa_retriever, docs_retriever]:
            for doc in retriever.invoke(question):
                key = hash(doc.page_content[:100])
                if key not in seen:
                    seen.add(key)
                    docs.append(doc)
        return docs

    def format_docs(docs: list) -> str:
        if not docs:
            return "⚠️ No relevant context retrieved from either namespace."
        return "\n\n---\n\n".join([
            f"[Source: {doc.metadata.get('namespace', doc.metadata.get('source', 'unknown'))}]\n{doc.page_content}"
            for doc in docs
        ])

    print("⛓️ Assembling Guide Agent LCEL chain...")
    guide_chain = (
        RunnableParallel({
            "context":  RunnablePassthrough()
                        | (lambda x: merged_retriever(x["question"]))
                        | format_docs,
            "question": RunnablePassthrough()
                        | (lambda x: x["question"]),
        })
        | guide_prompt
        | guide_llm
        | StrOutputParser()
    )
    print("✅ Guide Agent LCEL chain ready.")
    return guide_chain, merged_retriever


def guide_node(state: GraphState) -> dict:
    print(f"\n🧭 GUIDE NODE")
    print(f"   Question: {state['user_input']}")
    try:
        guide_chain, merged_retriever = _get_guide_components()
        retrieved_docs = merged_retriever(state["user_input"])
        print(f"   📦 Retrieved {len(retrieved_docs)} chunks total")
        answer = guide_chain.invoke({"question": state["user_input"]})
        print(f"   ✅ Guide answered")
        return {
            "guide_answer": answer,
            "final_answer": answer,
            "chat_history": [AIMessage(content=answer)],
        }
    except Exception as e:
        err = f"Guide node error: {str(e)}"
        print(f"   ❌ {err}")
        return {"guide_answer": "", "final_answer": "", "error": err}