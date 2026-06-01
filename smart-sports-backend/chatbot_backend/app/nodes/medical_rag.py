# """
# app/nodes/medical_rag.py
# ────────────────────────
# Medical RAG node — connects to Pinecone vector store.

# This replaces the %run NODE_sport_AI_RAG_system.ipynb call.
# The chain is initialized ONCE at import time (singleton pattern)
# so Pinecone isn't reconnected on every request.
# """
# import os
# from functools import lru_cache

# from langchain_groq import ChatGroq
# from langchain_pinecone import PineconeVectorStore
# from langchain_huggingface import HuggingFaceEmbeddings
# from langchain.chains.retrieval import create_retrieval_chain
# # أو إذا كنتِ مضطرة لاستخدام الكلاس القديم جداً (لا أنصح به):
# from langchain.chains import RetrievalQA
# from langchain_core.prompts import PromptTemplate
# from pinecone import Pinecone

# from app.config import settings
# from app.state import GraphState


# # ── RAG prompt ───────────────────────────────────────────────────
# _RAG_PROMPT = PromptTemplate(
#     input_variables=["context", "question"],
#     template="""You are SportsMed AI, an expert in sports medicine, exercise science, nutrition, and athletic performance.

# Use the following retrieved context to answer the question accurately.
# If the context doesn't contain the answer, use your medical knowledge but clearly state it's from general knowledge.

# Context:
# {context}

# Question: {question}

# Provide a clear, structured, and medically accurate answer.
# Include practical recommendations when relevant.
# Answer in the same language as the question (Arabic or English).
# """,
# )


# @lru_cache(maxsize=1)
# def _get_rag_chain():
#     """
#     Build and cache the RAG chain.
#     Called once — subsequent calls return the cached chain.
#     """
#     print("⏳ Initializing Medical RAG chain...")

#     # ── Pinecone ──────────────────────────────────────────────
#     pc = Pinecone(api_key=settings.PINECONE_API_KEY)
#     index = pc.Index(settings.PINECONE_INDEX_NAME)
#     print(f"   ✅ Pinecone index '{settings.PINECONE_INDEX_NAME}' connected")

#     # ── Embeddings (same model used when building the index) ──
#     embeddings = HuggingFaceEmbeddings(
#         model_name=settings.EMBEDDING_MODEL,
#         model_kwargs={"device": "cpu"},
#         encode_kwargs={"normalize_embeddings": True},
#     )
#     print(f"   ✅ Embeddings loaded: {settings.EMBEDDING_MODEL}")

#     # ── Vector store ──────────────────────────────────────────
#     vector_store = PineconeVectorStore(
#         index=index,
#         embedding=embeddings,
#         namespace=settings.PINECONE_NAMESPACE or None,
#     )
#     retriever = vector_store.as_retriever(
#         search_type="similarity",
#         search_kwargs={"k": 5},
#     )

#     # ── LLM ───────────────────────────────────────────────────
#     llm = ChatGroq(
#         model=settings.GROQ_MODEL,
#         api_key=settings.GROQ_API_KEY,
#         temperature=0.3,
#         max_tokens=1024,
#     )

#     # ── RAG chain ─────────────────────────────────────────────
#     chain = RetrievalQA.from_chain_type(
#         llm=llm,
#         chain_type="stuff",
#         retriever=retriever,
#         return_source_documents=True,
#         chain_type_kwargs={"prompt": _RAG_PROMPT},
#     )

#     print("   ✅ Medical RAG chain ready")
#     return chain


# # ── Node function ─────────────────────────────────────────────────
# def medical_rag_node(state: GraphState) -> dict:
#     print(f"\n⚕️  MEDICAL RAG NODE")
#     print(f"   Question: {state['user_input']}")

#     try:
#         chain = _get_rag_chain()
#         result = chain.invoke({"query": state["user_input"]})

#         # RetrievalQA returns 'result' and 'source_documents'
#         answer  = result.get("result", "")
#         context = result.get("source_documents", [])

#         print(f"   ✅ RAG answered — {len(context)} chunks retrieved")

#         return {
#             "rag_answer":  answer,
#             "rag_context": context,
#         }

#     except Exception as e:
#         err = f"RAG node error: {str(e)}"
#         print(f"   ❌ {err}")
#         return {
#             "rag_answer":  "",
#             "rag_context": [],
#             "error":       err,
#         }



# app/nodes/medical_rag.py
# import os
# from langchain_groq import ChatGroq
# from langchain_core.prompts import ChatPromptTemplate
# from langchain_huggingface import HuggingFaceEmbeddings
# from langchain_pinecone import PineconeVectorStore
# from langchain_core.runnables import RunnablePassthrough, RunnableParallel
# from langchain_core.output_parsers import StrOutputParser

# # الـ Imports المخصصة للـ RAG (المكان الصحيح للنسخ المثبتة أعلاه)
# from langchain_classic.retrievers.contextual_compression import ContextualCompressionRetriever
# from langchain_huggingface.document_compressors import CrossEncoderReranker

# from app.config import settings

# # ====================== MergerRetriever (من الـ notebook الأصلي) ======================
# from langchain_core.retrievers import BaseRetriever
# from langchain_core.documents import Document
# from langchain_core.callbacks import CallbackManagerForRetrieverRun
# from typing import List

# class MergerRetriever(BaseRetriever):
#     retrievers: List[BaseRetriever]

#     def _get_relevant_documents(
#         self, query: str, *, run_manager: CallbackManagerForRetrieverRun
#     ) -> List[Document]:
#         seen = set()
#         all_docs = []
#         for retriever in self.retrievers:
#             for doc in retriever.invoke(query):
#                 key = hash(doc.page_content[:100])
#                 if key not in seen:
#                     seen.add(key)
#                     all_docs.append(doc)
#         return all_docs

# # ====================== Setup ======================
# embeddings = HuggingFaceEmbeddings(
#     model_name="BAAI/bge-large-en-v1.5",
#     model_kwargs={"device": "cpu"},
#     encode_kwargs={"normalize_embeddings": True},
# )

# INDEX_NAME = "medical-sport-assistant"

# NAMESPACES = [
#     "gym&exercises", "strength-conditioning", "nutrition", "foods&nutrition",
#     "physio_rehab", "rehabilitation", "football_warmups", "gym_warmups"
# ]

# namespace_stores = {
#     ns: PineconeVectorStore(
#         index_name=INDEX_NAME,
#         embedding=embeddings,
#         namespace=ns
#     ) for ns in NAMESPACES
# }

# per_namespace_retrievers = [
#     store.as_retriever(
#         search_type="similarity_score_threshold",
#         search_kwargs={"k": 5, "score_threshold": 0.50}
#     ) for store in namespace_stores.values()
# ]

# merged_retriever = MergerRetriever(retrievers=per_namespace_retrievers)

# cross_encoder = HuggingFaceCrossEncoder(model_name="cross-encoder/ms-marco-MiniLM-L-6-v2")
# compressor = CrossEncoderReranker(model=cross_encoder, top_n=6)

# medical_retriever = ContextualCompressionRetriever(
#     base_compressor=compressor,
#     base_retriever=merged_retriever,
# )

# # ====================== LLM & Prompt ======================
# medical_llm = ChatGroq(
#     model="llama-3.3-70b-versatile",
#     temperature=0.2,
#     max_tokens=1024,
# )

# medical_system_prompt = """
# You are **SportsMed AI** — a world-class assistant built on evidence-based knowledge in Sports Medicine, Strength & Conditioning, Physical Rehabilitation, and Sports Nutrition.
# You think like a team of specialists: a sports physician, an NSCA-certified strength coach, a physiotherapist, and a registered sports dietitian.

# Answer strictly from the retrieved context. Never speculate or fabricate.
# Use clear structure with headers and bullet points.
# Always end clinical answers with a professional disclaimer.
# """

# medical_prompt = ChatPromptTemplate.from_messages([
#     ("system", medical_system_prompt),
#     ("human", "━━━━━━━━━━━━━━━━━━━━━━━━━\n🙋 USER QUESTION:\n{input}\n━━━━━━━━━━━━━━━━━━━━━━━━━"),
# ])

# # ====================== Chain ======================
# from langchain_classic.chains import create_retrieval_chain
# from langchain_classic.chains.combine_documents import create_stuff_documents_chain

# question_answer_chain = create_stuff_documents_chain(medical_llm, medical_prompt)
# medical_rag_chain = create_retrieval_chain(medical_retriever, question_answer_chain)

# def ask_medical_rag(question: str):
#     result = medical_rag_chain.invoke({"input": question})
#     return result["answer"]























"""
app/nodes/medical_rag.py
────────────────────────
Exact replica of NODE_sport_AI_RAG_system.ipynb
Fixed imports for Windows compatibility
"""
"""
app/nodes/medical_rag.py — Fixed for modern LangChain on Windows
"""
"""
app/nodes/medical_rag.py
Imports verified working on langchain==0.3.7 + langchain-community==0.3.7
"""
import logging
from functools import lru_cache
from typing import List

from pydantic import Field
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.retrievers import BaseRetriever
from langchain_core.documents import Document
from langchain_core.callbacks import CallbackManagerForRetrieverRun
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_pinecone import PineconeVectorStore
from langchain_community.cross_encoders import HuggingFaceCrossEncoder
from langchain_classic.retrievers.contextual_compression import ContextualCompressionRetriever
from langchain_classic.retrievers.document_compressors import CrossEncoderReranker
from langchain_classic.chains import create_retrieval_chain
from langchain_classic.chains.combine_documents import create_stuff_documents_chain

from app.config import settings
from app.state import GraphState

logging.getLogger("langchain_pinecone.vectorstores").setLevel(logging.ERROR)
logging.getLogger("langchain_core.vectorstores.base").setLevel(logging.ERROR)

INDEX_NAME = "medical-sport-assistant"
NAMESPACES = [
    "gym&exercises",
    "strength-conditioning",
    "nutrition",
    "foods&nutrition",
    "physio_rehab",
    "rehabilitation",
    "football_warmups",
    "gym_warmups",
]


class MergerRetriever(BaseRetriever):
    retrievers: List[BaseRetriever] = Field(default_factory=list)

    def _get_relevant_documents(
        self,
        query: str,
        *,
        run_manager: CallbackManagerForRetrieverRun,
    ) -> List[Document]:
        seen     = set()
        all_docs = []
        for retriever in self.retrievers:
            for doc in retriever.invoke(query):
                key = hash(doc.page_content[:100])
                if key not in seen:
                    seen.add(key)
                    all_docs.append(doc)
        return all_docs


@lru_cache(maxsize=1)
def _get_rag_chain():
    print("🔌 Loading embedding model and connecting to Pinecone namespaces...")

    embeddings = HuggingFaceEmbeddings(
        model_name="BAAI/bge-large-en-v1.5",
        model_kwargs={"device": "cpu"},
        encode_kwargs={"normalize_embeddings": True},
    )

    namespace_stores = {
        ns: PineconeVectorStore(
            index_name=INDEX_NAME,
            embedding=embeddings,
            namespace=ns,
        )
        for ns in NAMESPACES
    }
    print(f"✅ Connected to {len(namespace_stores)} specialized namespaces.")

    per_namespace_retrievers = [
        store.as_retriever(
            search_type="similarity_score_threshold",
            search_kwargs={"k": 5, "score_threshold": 0.50},
        )
        for store in namespace_stores.values()
    ]

    merged_retriever = MergerRetriever(retrievers=per_namespace_retrievers)

    cross_encoder = HuggingFaceCrossEncoder(
        model_name="cross-encoder/ms-marco-MiniLM-L-6-v2"
    )
    compressor = CrossEncoderReranker(model=cross_encoder, top_n=6)

    medical_retriever = ContextualCompressionRetriever(
        base_compressor=compressor,
        base_retriever=merged_retriever,
    )
    print("✅ RAG Pipeline ready: Multi-Namespace → Merge → Rerank active.")

    medical_llm = ChatGroq(
        model="openai/gpt-oss-120b",
        api_key=settings.GROQ_API_KEY,
        temperature=0.2,
        max_tokens=1024,
    )

    medical_system_prompt = """
You are **SportsMed AI** — a world-class assistant built on evidence-based knowledge \
in Sports Medicine, Strength & Conditioning, Physical Rehabilitation, and Sports Nutrition. \
You think like a team of specialists: a sports physician, an NSCA-certified strength coach, \
a physiotherapist, and a registered sports dietitian — all working together.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📚 RETRIEVED KNOWLEDGE BASE:
{context}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

══════════════════════════════════════════
           CORE RESPONSE RULES
══════════════════════════════════════════

▸ RULE 1 — GROUND TRUTH ONLY
  Answer strictly from the retrieved context above.
  Never speculate, extrapolate, or fabricate clinical or training advice.
  If you are uncertain about a detail — say so explicitly.

▸ RULE 2 — COVERAGE TIERS (choose the right one every time)

  ✅ FULL COVERAGE  → Context contains a clear answer.
     Give a complete, structured, professional response with all relevant detail.

  ⚠️ PARTIAL COVERAGE → Context has related but incomplete information.
     Answer what IS supported, then add this note at the end:
     "⚠️ Knowledge Gap: My sources have limited detail on [specific missing aspect].
      For complete guidance, consult a licensed [physician / physiotherapist / dietitian]."

  ❌ NO COVERAGE → Context is empty or entirely unrelated.
     Respond ONLY with:
     "❌ No relevant documents were found for this query.
      Try rephrasing your question, or this topic may not be in the current knowledge base."
     Do NOT attempt to answer from memory.

▸ RULE 3 — CLINICAL BOUNDARIES
  • Never prescribe medication names or dosages.
  • Never diagnose injuries, conditions, or deficiencies.
  • Never replace individualized assessment by a licensed professional.
  • For any clinical decision → always close with:
    "⚕️ Always consult a qualified sports medicine professional before applying this to individual cases."

▸ RULE 4 — MULTI-PART QUESTIONS
  If the user asks multiple questions, address each one individually.
  Use numbered sections (## 1. / ## 2. / etc.) so no sub-question is skipped or merged.

▸ RULE 5 — ANSWER QUALITY STANDARDS
  Every response must be:
  • Precise      — no filler, no vague generalities
  • Structured   — use headers (##), bullet points, and section breaks
  • Layered      — go from general concept → specific detail → practical application
  • Cited-aware  — if the source name is in the metadata, mention it (e.g. "According to [source]...")
  • Actionable   — end with a practical takeaway or recommendation where appropriate

══════════════════════════════════════════
        MANDATORY RESPONSE FORMAT
══════════════════════════════════════════

## 🏷️ [Clear Title of the Answer]

### Overview
[1–3 sentence summary of the core concept]

### Key Details
[Bullet points or sub-sections with depth]

### Practical Application
[How this applies in training, rehab, or nutrition context]

### ⚕️ Professional Note  ← include ONLY when clinically relevant
[Safety advisory or recommendation to consult a professional]

---
*Sources: [list source names from metadata if available]*

══════════════════════════════════════════
        DOMAIN BEHAVIOR PROFILES
══════════════════════════════════════════

When the question is about EXERCISE / STRENGTH:
  → Lead with: primary muscles, movement mechanics, programming variables (sets/reps/tempo)
  → Include: common errors, injury risk, exercise variations
  → For muscle questions: always list Primary → Secondary → Stabilizers → Technique variants
  → Never omit adductors, core, or stabilizer muscles if the movement is compound

When the question is about REHABILITATION / INJURY:
  → Lead with: anatomy involved, mechanism of injury
  → Include: phases of recovery (acute → subacute → return to sport)
  → Always close with the ⚕️ Professional Note

When the question is about NUTRITION:
  → Lead with: macronutrient role, timing, food sources
  → Include: sport-specific considerations if context supports it
  → Avoid: specific supplement dosages or medical nutrition therapy

When the question is about PHYSIOLOGY / THEORY:
  → Lead with: the underlying mechanism
  → Use analogies to make complex concepts accessible
  → Connect theory to practical sports performance outcomes
"""

    medical_prompt = ChatPromptTemplate.from_messages([
        ("system", medical_system_prompt),
        ("human",
         "━━━━━━━━━━━━━━━━━━━━━━━━━\n"
         "🙋 USER QUESTION:\n{input}\n"
         "━━━━━━━━━━━━━━━━━━━━━━━━━\n"
         "Identify the domain (Exercise / Rehab / Nutrition / Physiology) and respond."
         ),
    ])

    print("⛓️ Assembling Medical RAG chain...")
    question_answer_chain = create_stuff_documents_chain(medical_llm, medical_prompt)
    medical_rag_chain     = create_retrieval_chain(medical_retriever, question_answer_chain)
    print("✅ SportsMed AI RAG is fully assembled.")
    return medical_rag_chain


def medical_rag_node(state: GraphState) -> dict:
    print(f"\n⚕️  MEDICAL RAG NODE — {state['user_input']}")
    try:
        chain   = _get_rag_chain()
        result  = chain.invoke({"input": state["user_input"]})
        answer  = result.get("answer", "")
        context = result.get("context", [])
        print(f"   ✅ RAG answered — {len(context)} chunks retrieved")
        return {"rag_answer": answer, "rag_context": context}
    except Exception as e:
        err = f"RAG node error: {str(e)}"
        print(f"   ❌ {err}")
        return {"rag_answer": "", "rag_context": [], "error": err}


