import { useRef, useState } from 'react';

function CameraCapture({ onCapture }) {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);

  async function startCamera() {
    const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    setStream(s);
    videoRef.current.srcObject = s;
  }

  function takePhoto() {
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg');
    onCapture(dataUrl); // base64 image — ready to send to your backend
  }

  function stopCamera() {
    stream?.getTracks().forEach(track => track.stop());
  }

  return (
    <div>
      <video ref={videoRef} autoPlay playsInline style={{ width: '100%' }} />
      <button onClick={startCamera}>Start Camera</button>
      <button onClick={takePhoto}>Snap Photo</button>
      <button onClick={stopCamera}>Stop Camera</button>
    </div>
  );
}

export default CameraCapture;