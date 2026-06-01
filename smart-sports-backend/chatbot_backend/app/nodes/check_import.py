"""
شغلي الـ script ده في الـ terminal عشان تعرفي
الـ imports الصح على الـ langchain version عندك:

python fix_imports.py
"""
tests = [
    "from langchain_community.retrievers import ContextualCompressionRetriever",
    "from langchain.retrievers.contextual_compression import ContextualCompressionRetriever",
    "from langchain_community.document_compressors.cross_encoder import CrossEncoderReranker",
    "from langchain.retrievers.document_compressors import CrossEncoderReranker",
    "from langchain.chains import create_retrieval_chain",
    "from langchain_core.runnables import RunnablePassthrough",
]

print("Testing imports on YOUR environment...\n")
for t in tests:
    try:
        exec(t)
        print(f"✅ {t}")
    except Exception as e:
        print(f"❌ {t}")
        print(f"   Error: {e}\n")