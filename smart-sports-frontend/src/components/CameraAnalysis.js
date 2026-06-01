import React, { useState, useEffect } from "react";
import { useReactMediaRecorder } from "react-media-recorder-2";
import axios from "axios";

const CameraAnalysis = ({ selectedExercise, token }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  
  const {
    status,
    startRecording,
    stopRecording,
    previewStream,
    mediaBlobUrl,
  } = useReactMediaRecorder({ 
    video: true,
    // تغيير النوع لـ video/webm;codecs=vp8 عشان ده النوع الأكثر استقراراً في المتصفحات
    blobPropertyBag: { type: "video/webm" } 
  });

  const handleFinish = async () => {
    stopRecording();
    // ننتظر 500ms لضمان أن المتصفح أغلق ملف الفيديو صح في الذاكرة
    setTimeout(() => {
        // نستخدم القيمة المباشرة من الـ recorder لو موجودة
        if (mediaBlobUrl) {
            handleSendVideo(mediaBlobUrl);
        }
    }, 500);
  };
  

  // دالة إرسال الفيديو المسجل للباك إند
  const handleSendVideo = async (blobUrl) => {
    setLoading(true);
    try {
      const videoBlob = await fetch(blobUrl).then((r) => r.blob());
      const videoFile = new File([videoBlob], "recorded_exercise.mp4", { type: "video/mp4" });

      const formData = new FormData();
      formData.append("file", videoFile);
      formData.append("exercise_name", selectedExercise); // يمكن تغييرها حسب اختيار المستخدم

      const response = await axios.post("http://127.0.0.1:8000/exercise/analyze", formData, {
        headers: {
          Authorization: `Bearer ${token}`, // التوكن السحري اللي بيحل المشكلة
          "Content-Type": "multipart/form-data",
        },
      });
      setResult(response.data);
    } catch (error) {
      console.error("Error uploading recorded video:", error);
      alert("حدث خطأ في تحليل التسجيل");
    } finally {
      setLoading(false);
    }
  };

  // تأثير جانبي: أول ما التسجيل يخلص والـ URL يتوفر، ابعت للفيديو تلقائياً
  useEffect(() => {
    if (mediaBlobUrl && status === "stopped") {
      handleSendVideo(mediaBlobUrl);
    }
  }, [mediaBlobUrl, status]);

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h3>🎥 تمرين مباشر بالكاميرا</h3>
      
      <div style={{ marginBottom: "20px" }}>
        <p>الحالة: <span style={{ color: status === "recording" ? "red" : "black" }}>{status}</span></p>
        
        {/* عرض بث الكاميرا الحي للاعب */}
        <VideoPreview stream={previewStream} />

        <div style={{ marginTop: "10px" }}>
          {status !== "recording" ? (
            <button onClick={startRecording} style={btnStyle}>ابدأ التمرين</button>
          ) : (
            <button onClick={handleFinish} style={{ ...btnStyle, backgroundColor: "red" }}>توقف وتحليل</button>
          )}
        </div>
      </div>

      {loading && <div> جاري معالجة الفيديو ورسم المفاصل... ⏳</div>}

      {result && (
        <div style={{ marginTop: "30px" }}>
          <h4>النتيجة النهائية: {result.total_reps} عدات</h4>
          <video 
            key={result.video_url} 
            controls 
            src={`http://127.0.0.1:8000${result.video_url}`} 
            style={{ width: "100%", maxWidth: "600px", borderRadius: "10px" }} 
          />
          {result.audio_url && (
            <audio key={result.audio_url} autoPlay src={`http://127.0.0.1:8000${result.audio_url}`} />
          )}
        </div>
      )}
    </div>
  );
};

// Component بسيط لعرض الـ Preview بتاع الكاميرا
const VideoPreview = ({ stream }) => {
  const videoRef = React.useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  if (!stream) return <div style={camPlaceholder}>الكاميرا مغلقة</div>;

  return <video ref={videoRef} autoPlay playsInline style={camStyle} />;
};

// تنسيقات بسيطة
const btnStyle = { padding: "10px 20px", fontSize: "16px", cursor: "pointer", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "5px" };
const camStyle = { width: "100%", maxWidth: "600px", transform: "scaleX(-1)", borderRadius: "10px", border: "3px solid #ddd" };
const camPlaceholder = { width: "100%", maxWidth: "600px", height: "300px", backgroundColor: "#eee", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", borderRadius: "10px" };

export default CameraAnalysis;