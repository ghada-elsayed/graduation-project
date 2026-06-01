# """
# app/nodes/reviewer.py
# ─────────────────────
# Reviewer node — evaluates the RAG answer quality.

# Replaces: %run NODE_reviewer_for_RAG.ipynb
# """
# import json
# from langchain_groq import ChatGroq
# from langchain_core.prompts import ChatPromptTemplate
# from langchain_core.messages import AIMessage

# from app.config import settings
# from app.state import GraphState


# _reviewer_llm = ChatGroq(
#     model=settings.GROQ_MODEL,
#     api_key=settings.GROQ_API_KEY,
#     temperature=0.0,
#     max_tokens=512,
# )

# _reviewer_prompt = ChatPromptTemplate.from_messages([
#     ("system", """
# You are a medical and sports science quality reviewer.
# Evaluate the answer given to the user's question based on the retrieved context.

# EVALUATION CRITERIA:
# 1. Accuracy — is the answer medically correct?
# 2. Completeness — does it fully answer the question?
# 3. Safety — does it avoid dangerous medical advice?
# 4. Clarity — is it well-structured and clear?

# VERDICT OPTIONS:
#   APPROVE  → answer is good, use as-is
#   REVISE   → answer needs improvement, provide revised version
#   REJECT   → answer is wrong or unsafe, reject it

# Respond ONLY with valid JSON (no markdown, no extra text):
# {{
#   "verdict": "APPROVE" | "REVISE" | "REJECT",
#   "score": <integer 1-10>,
#   "reason": "<brief reason>",
#   "revised_answer": "<improved answer if verdict=REVISE, else null>"
# }}
# """),
#     ("human", """
# Question: {question}

# Retrieved Context:
# {context}

# RAG Answer:
# {rag_answer}

# Evaluate:
# """),
# ])


# def _format_context(docs: list) -> str:
#     """Convert LangChain Document objects or plain strings to text."""
#     if not docs:
#         return "No context retrieved."
#     parts = []
#     for i, doc in enumerate(docs[:3], 1):  # limit to 3 chunks
#         if hasattr(doc, "page_content"):
#             parts.append(f"[Chunk {i}]: {doc.page_content[:400]}")
#         else:
#             parts.append(f"[Chunk {i}]: {str(doc)[:400]}")
#     return "\n\n".join(parts)


# def review_answer(question: str, rag_answer: str, context_docs: list) -> dict:
#     """Core review logic — called from reviewer_node."""
#     chain = _reviewer_prompt | _reviewer_llm

#     result = chain.invoke({
#         "question":   question,
#         "rag_answer": rag_answer,
#         "context":    _format_context(context_docs),
#     })

#     try:
#         review = json.loads(result.content.strip())
#     except json.JSONDecodeError:
#         # Fallback if LLM doesn't return clean JSON
#         print("   ⚠️  Reviewer returned non-JSON, defaulting to APPROVE")
#         review = {
#             "verdict":        "APPROVE",
#             "score":          7,
#             "reason":         "JSON parse failed — auto-approved",
#             "revised_answer": None,
#         }

#     return review


# # ── Node function ─────────────────────────────────────────────────
# def reviewer_node(state: GraphState) -> dict:
#     print(f"\n🔍 REVIEWER NODE")

#     try:
#         review  = review_answer(
#             question     = state["user_input"],
#             rag_answer   = state["rag_answer"],
#             context_docs = state["rag_context"],
#         )
#         verdict = review.get("verdict", "APPROVE")

#         if verdict == "REVISE":
#             final = review.get("revised_answer") or state["rag_answer"]
#             print(f"   ⚠️  REVISED — score: {review.get('score')}/10")
#         elif verdict == "REJECT":
#             final = (
#                 "❌ Answer rejected by quality reviewer.\n"
#                 "Please rephrase your question or provide more details."
#             )
#             print(f"   ❌ REJECTED")
#         else:
#             final = state["rag_answer"]
#             print(f"   ✅ APPROVED — score: {review.get('score')}/10")

#         return {
#             "reviewer_verdict": verdict,
#             "reviewer_output":  review,
#             "final_answer":     final,
#             "chat_history":     [AIMessage(content=final)],
#         }

#     except Exception as e:
#         err = f"Reviewer error: {str(e)}"
#         print(f"   ❌ {err}")
#         # Fallback — pass through the RAG answer
#         return {
#             "reviewer_verdict": "APPROVE",
#             "reviewer_output":  {},
#             "final_answer":     state["rag_answer"],
#             "chat_history":     [AIMessage(content=state["rag_answer"])],
#             "error":            err,
#         }







# app/nodes/reviewer.py
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from pydantic import BaseModel, Field
from typing import Literal

class ReviewResult(BaseModel):
    verdict: Literal["APPROVE", "REVISE", "REJECT"]
    score: int = Field(ge=0, le=10)
    factual_grounding: str
    completeness: str
    clinical_safety: str
    hallucination_flags: list[str]
    issues: list[str]
    revised_answer: str = ""
    reviewer_notes: str

parser = JsonOutputParser(pydantic_object=ReviewResult)

reviewer_llm = ChatGroq(model="llama-3.3-70b-versatile", temperature=0.1, max_tokens=2048)

reviewer_system_prompt =  """
You are **MedReview AI** — a strict, expert-level quality control agent for a \
Sports Medicine and Fitness AI assistant.

Your ONLY job is to critically evaluate answers produced by a RAG (Retrieval-Augmented \
Generation) system and decide: APPROVE, REVISE, or REJECT.

You will receive three inputs:
  1. The original user question
  2. The RAG agent's answer
  3. The retrieved context chunks the RAG agent had access to

══════════════════════════════════════════
         YOUR REVIEW CHECKLIST
══════════════════════════════════════════

Check each dimension carefully:

🔬 FACTUAL GROUNDING
   → Every claim in the answer must be traceable to the retrieved context.
   → Flag anything stated with confidence that is NOT in the context.

📋 COMPLETENESS
   → If the user asked multiple questions, all must be addressed.
   → Flag any sub-question that was skipped or only partially answered.

⚕️ CLINICAL SAFETY
   → Flag any medication names or dosages recommended.
   → Flag any direct injury diagnoses made.
   → Flag any advice that replaces individualized professional assessment.

🚨 HALLUCINATION SCAN
   → List every muscle name, anatomical term, or clinical claim
     that appears in the answer but NOT in the retrieved context.

══════════════════════════════════════════
         VERDICT CRITERIA
══════════════════════════════════════════

✅ APPROVE  → Score 8–10
   • All claims grounded in context
   • All sub-questions answered
   • No clinical safety violations
   • No hallucinations detected

⚠️ REVISE   → Score 4–7
   • Minor gaps, missing details, or slightly ungrounded claims
   • Provide a corrected, improved version in revised_answer
   • Be specific about what you changed and why

❌ REJECT   → Score 0–3
   • Major hallucinations detected
   • Clinical safety violations present
   • Context was empty but model answered anyway
   • Answer is dangerously incomplete or misleading

══════════════════════════════════════════
         OUTPUT FORMAT — CRITICAL
══════════════════════════════════════════

You MUST respond with ONLY a valid JSON object. No preamble, no explanation outside JSON.
No markdown code fences. Raw JSON only.

{format_instructions}
"""

reviewer_prompt = ChatPromptTemplate.from_messages([
    ("system", reviewer_system_prompt),
    ("human", """
Original Question: {question}
RAG Answer: {rag_answer}
Retrieved Context: {context}

Return ONLY the JSON review.
""")
]).partial(format_instructions=parser.get_format_instructions())

reviewer_chain = reviewer_prompt | reviewer_llm | parser

def review_answer(question: str, rag_answer: str, context_docs: list):
    context_text = "\n\n---\n\n".join([doc.page_content for doc in context_docs]) if context_docs else "No context retrieved."
    return reviewer_chain.invoke({
        "question": question,
        "rag_answer": rag_answer,
        "context": context_text,
    })
from langchain_core.messages import AIMessage
from app.state import GraphState

def reviewer_node(state: GraphState) -> dict:
    print(f"\n🔍 REVIEWER NODE")
    try:
        review  = review_answer(
            question     = state["user_input"],
            rag_answer   = state["rag_answer"],
            context_docs = state["rag_context"],
        )
        verdict = review.get("verdict", "APPROVE")

        if verdict == "REVISE":
            final = review.get("revised_answer") or state["rag_answer"]
            print(f"   ⚠️  REVISED — score: {review.get('score')}/10")
        elif verdict == "REJECT":
            final = "❌ Answer rejected. Please rephrase your question."
            print(f"   ❌ REJECTED — score: {review.get('score')}/10")
        else:
            final = state["rag_answer"]
            print(f"   ✅ APPROVED — score: {review.get('score')}/10")

        return {
            "reviewer_verdict": verdict,
            "reviewer_output":  review,
            "final_answer":     final,
            "chat_history":     [AIMessage(content=final)],
        }

    except Exception as e:
        print(f"   ❌ Reviewer error: {str(e)}")
        return {
            "reviewer_verdict": "APPROVE",
            "reviewer_output":  {},
            "final_answer":     state["rag_answer"],
            "chat_history":     [AIMessage(content=state["rag_answer"])],
            "error":            str(e),
        }