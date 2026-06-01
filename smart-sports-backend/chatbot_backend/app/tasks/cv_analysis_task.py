# app/tasks/cv_analysis_task.py
from celery import shared_task
from app.nodes.feedback import analyze_athletic_profile  # الكود الأصلي
import os
import json
from datetime import datetime

@shared_task(bind=True, max_retries=2)
def analyze_cv_task(self, file_path: str, question: str, thread_id: str):
    """
    Celery Task لتحليل الـ CV / PDF
    """
    try:
        print(f"🚀 Starting CV Analysis Task - Thread: {thread_id}")
        print(f"📄 File: {file_path}")

        # استخدام الدالة الأصلية بدون أي تعديل
        result = analyze_athletic_profile(
            file_path=file_path,
            specific_question=question
        )

        # حفظ النتيجة في ملف JSON للـ Frontend يقدر يجيبها لاحقاً
        output_dir = "static/results"
        os.makedirs(output_dir, exist_ok=True)

        result_data = {
            "task_id": self.request.id,
            "thread_id": thread_id,
            "status": "completed",
            "final_answer": result,
            "completed_at": datetime.now().isoformat(),
            "file_path": file_path
        }

        result_path = f"{output_dir}/cv_result_{thread_id}_{self.request.id[:8]}.json"
        
        with open(result_path, "w", encoding="utf-8") as f:
            json.dump(result_data, f, ensure_ascii=False, indent=2)

        print(f"✅ CV Analysis completed and saved to: {result_path}")

        # حذف الملف المؤقت بعد التحليل (اختياري)
        if os.path.exists(file_path):
            os.remove(file_path)

        return {
            "status": "success",
            "final_answer": result,
            "result_file": result_path
        }

    except Exception as e:
        print(f"❌ CV Task failed: {str(e)}")
        # Retry logic
        raise self.retry(exc=e, countdown=60)  # retry after 1 minute