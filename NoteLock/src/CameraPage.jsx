import { useRef, useState, useEffect } from 'react';

const SUBJECTS = ['CAB302', 'EFB210', 'CAB201', 'AYB150'];

const s = {
  page: {
    minHeight: '100svh',
    display: 'flex',
    flexDirection: 'column',
    background: '#fff',
    fontFamily: 'system-ui, sans-serif',
  },
  header: {
    padding: '16px 20px',
  },
  dropdown: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: 12,
    border: '1px solid #111827',
    fontSize: 16,
    fontWeight: 700,
    background: '#fff',
    color: '#111827',
    appearance: 'none',
    cursor: 'pointer',
  },
  previewWrap: {
    flex: 1,
    margin: '0 20px',
    borderRadius: 12,
    background: '#d9d9d9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  placeholder: {
    color: '#9ca3af',
    fontSize: 14,
  },
  footer: {
    display: 'flex',
    justifyContent: 'center',
    padding: '24px 20px',
  },
  captureBtn: {
    width: 64,
    height: 64,
    borderRadius: 16,
    border: 'none',
    background: '#f2c14e',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '2px 2px 0 rgba(0,0,0,0.9)',
  },
  error: {
    fontSize: 13,
    color: '#ef4444',
    textAlign: 'center',
    padding: '0 20px 12px',
  },
};

function CameraIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

export default function CameraPage({ onCapture }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startCamera() {
    setError(null);
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = s;
      if (videoRef.current) videoRef.current.srcObject = s;
      setIsActive(true);
    } catch (err) {
      console.error('Camera access failed:', err);
      setError('Camera access is required. Please allow camera permission and try again.');
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
      setError('Camera is still starting up — try again in a moment.');
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg');

    onCapture(dataUrl, subject);
  }

  return (
    <div style={s.page}>
      <div style={s.header}>
        <select
          style={s.dropdown}
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        >
          {SUBJECTS.map((subj) => (
            <option key={subj} value={subj}>{subj}</option>
          ))}
        </select>
      </div>

      {error && <p style={s.error}>{error}</p>}

      <div style={s.previewWrap}>
        {isActive ? (
          <video ref={videoRef} autoPlay playsInline muted style={s.video} />
        ) : (
          <span style={s.placeholder}>Starting camera…</span>
        )}
      </div>

      <div style={s.footer}>
        <button style={s.captureBtn} onClick={takePhoto} aria-label="Capture slide">
          <CameraIcon />
        </button>
      </div>
    </div>
  );
}
