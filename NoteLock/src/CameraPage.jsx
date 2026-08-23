import { useRef, useState, useEffect } from "react";
import { getSubjects } from "./store";

const MAX_RECORDING_SECONDS = 30;
const AUDIO_MIME_CANDIDATES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mp4",
  "audio/ogg",
];

const s = {
  page: {
    minHeight: "100svh",
    display: "flex",
    flexDirection: "column",
    background: "#fff",
    fontFamily: "system-ui, sans-serif",
  },
  header: {
    padding: "16px 20px",
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  backBtn: {
    flexShrink: 0,
    width: 35,
    height: 35,
    display: "grid",
    placeItems: "center",
    color: "#111",
    background: "#ffd21a",
    border: "2px solid #111",
    borderRadius: 10,
    boxShadow: "2px 2px 0 #111",
    cursor: "pointer",
  },
  dropdown: {
    width: "100%",
    padding: "12px 16px",
    borderRadius: 12,
    border: "1px solid #111827",
    fontSize: 16,
    fontWeight: 700,
    background: "#fff",
    color: "#111827",
    appearance: "none",
    cursor: "pointer",
  },
  previewWrap: {
    flex: 1,
    margin: "0 20px",
    borderRadius: 12,
    background: "#d9d9d9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
  },
  video: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  placeholder: {
    color: "#9ca3af",
    fontSize: 14,
  },
  audioIdle: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
    color: "#6b7280",
  },
  audioHint: {
    fontSize: 14,
    fontWeight: 600,
  },
  timerText: {
    fontSize: 32,
    fontWeight: 800,
    color: "#111",
    fontVariantNumeric: "tabular-nums",
  },
  recordDot: {
    width: 14,
    height: 14,
    borderRadius: "50%",
    background: "#ef4444",
  },
  recordingRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  footer: {
    display: "flex",
    justifyContent: "center",
    padding: "24px 20px",
  },
  captureBtn: {
    width: 64,
    height: 64,
    borderRadius: 16,
    border: "none",
    background: "#f2c14e",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "2px 2px 0 rgba(0,0,0,0.9)",
  },
  recordBtn: {
    width: 64,
    height: 64,
    borderRadius: 16,
    border: "2px solid #111",
    background: "#ffd21a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "2px 2px 0 #111",
  },
  recordBtnActive: {
    background: "#ef4444",
    borderColor: "#111",
  },
  error: {
    fontSize: 13,
    color: "#ef4444",
    textAlign: "center",
    padding: "0 20px 12px",
  },
};

function CameraIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#111827"
      strokeWidth="2"
    >
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M11 6l-6 6 6 6" />
    </svg>
  );
}

function MicIcon({ color = "#111827" }) {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0" />
      <path d="M12 18v3" />
      <path d="M8 21h8" />
    </svg>
  );
}

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const sec = totalSeconds % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export default function CameraPage({ mode = "photo", onCapture, onBack, externalError }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [subjects, setSubjects] = useState([]);
  const [subjectId, setSubjectId] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioStreamRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    loadSubjects();
    if (mode === "photo") {
      startCamera();
      return () => stopCamera();
    }
    return () => stopRecording({ discard: true });
  }, [mode]);

  async function loadSubjects() {
    try {
      const data = await getSubjects();
      setSubjects(data);
      if (data.length > 0) setSubjectId(data[0].id);
    } catch (err) {
      console.error("Failed to load subjects:", err);
      setError("Could not load your folders.");
    }
  }

  async function startCamera() {
    setError(null);
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = s;
      if (videoRef.current) videoRef.current.srcObject = s;
      setIsActive(true);
    } catch (err) {
      console.error("Camera access failed:", err);
      setError(
        "Camera access is required. Please allow camera permission and try again.",
      );
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setIsActive(false);
  }

  function takePhoto() {
    const video = videoRef.current;
    if (!video || !video.videoWidth) {
      setError("Camera is still starting up — try again in a moment.");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg");
    const subjectName = subjects.find((subj) => subj.id === subjectId)?.name;

    onCapture({ mode: "photo", dataUrl }, subjectId, subjectName);
  }

  async function startRecording() {
    if (typeof MediaRecorder === "undefined") {
      setError("Audio recording isn't supported in this browser.");
      return;
    }

    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;

      const mimeType = AUDIO_MIME_CANDIDATES.find((type) => MediaRecorder.isTypeSupported(type));
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: recorder.mimeType || "audio/webm" });
        audioStreamRef.current?.getTracks().forEach((track) => track.stop());
        audioStreamRef.current = null;

        if (blob.size === 0) {
          setError("No audio captured — try recording again.");
          return;
        }

        try {
          const dataUrl = await blobToDataUrl(blob);
          const subjectName = subjects.find((subj) => subj.id === subjectId)?.name;
          onCapture({ mode: "audio", dataUrl }, subjectId, subjectName);
        } catch (err) {
          console.error("Failed to read recording:", err);
          setError("Could not process the recording — try again.");
        }
      };

      recorder.start();
      setRecording(true);
      setElapsed(0);
      timerRef.current = setInterval(() => {
        setElapsed((prev) => {
          const next = prev + 1;
          if (next >= MAX_RECORDING_SECONDS) {
            stopRecording();
          }
          return next;
        });
      }, 1000);
    } catch (err) {
      console.error("Microphone access failed:", err);
      setError("Microphone access is required. Please allow microphone permission and try again.");
    }
  }

  function stopRecording({ discard = false } = {}) {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    const recorder = mediaRecorderRef.current;
    if (discard && recorder) {
      recorder.onstop = null;
      audioStreamRef.current?.getTracks().forEach((track) => track.stop());
      audioStreamRef.current = null;
    }
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    }
    mediaRecorderRef.current = null;
    setRecording(false);
  }

  function toggleRecording() {
    if (recording) {
      stopRecording();
    } else {
      startRecording();
    }
  }

  return (
    <div style={s.page}>
      <div style={s.header}>
        {onBack && (
          <button style={s.backBtn} type="button" aria-label="Go back" onClick={onBack}>
            <BackIcon />
          </button>
        )}
        <select
          style={s.dropdown}
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
        >
          {subjects.length === 0 ? (
            <option value="">No folders yet</option>
          ) : (
            subjects.map((subj) => (
              <option key={subj.id} value={subj.id}>
                {subj.name}
              </option>
            ))
          )}
        </select>
      </div>

      {(error || externalError) && <p style={s.error}>{error || externalError}</p>}

      {mode === "photo" ? (
        <>
          <div style={s.previewWrap}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ ...s.video, display: isActive ? "block" : "none" }}
            />
            {!isActive && <span style={s.placeholder}>Starting camera…</span>}
          </div>

          <div style={s.footer}>
            <button
              style={s.captureBtn}
              onClick={takePhoto}
              aria-label="Capture slide"
            >
              <CameraIcon />
            </button>
          </div>
        </>
      ) : (
        <>
          <div style={s.previewWrap}>
            {recording ? (
              <div style={s.recordingRow}>
                <span style={s.recordDot} />
                <span style={s.timerText}>{formatTime(elapsed)} / 0:{MAX_RECORDING_SECONDS}</span>
              </div>
            ) : (
              <div style={s.audioIdle}>
                <MicIcon color="#9ca3af" />
                <span style={s.audioHint}>Tap to record (30s max)</span>
              </div>
            )}
          </div>

          <div style={s.footer}>
            <button
              style={{ ...s.recordBtn, ...(recording ? s.recordBtnActive : {}) }}
              onClick={toggleRecording}
              aria-label={recording ? "Stop recording" : "Start recording"}
            >
              <MicIcon color={recording ? "#fff" : "#111827"} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
