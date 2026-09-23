import { useState, useEffect, useRef } from "react";
import { AsciiCanvas } from "./AsciiCanvas";
import type { EditorState } from "./Sidebar";

// ─── Props ────────────────────────────────────────────────────────────────────
interface PreviewCanvasProps {
  editor:           EditorState;
  uploadedImageUrl: string | null;
  mediaStream:      MediaStream | null;
  onFps?:           (fps: number) => void;
}

// ─── Webcam render (real DOM video element for reliable readyState) ───────────
function WebcamAscii({ mediaStream, editor, onFps }: {
  mediaStream: MediaStream;
  editor:      EditorState;
  onFps?:      (fps: number) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [source, setSource] = useState<HTMLVideoElement | null>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.srcObject   = mediaStream;
    v.muted       = true;
    v.playsInline = true;

    const onReady = () => {
      if (v.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) setSource(v);
    };

    // Resume playback after any stall/suspend/pause (e.g. tab backgrounded,
    // GPU throttle, or camera driver hiccup).
    const tryPlay = () => {
      void v.play().then(onReady).catch(() => {});
    };

    v.addEventListener("loadedmetadata", onReady);
    v.addEventListener("canplay",        onReady);
    v.addEventListener("playing",        onReady);
    v.addEventListener("stalled",        tryPlay);
    v.addEventListener("suspend",        tryPlay);
    v.addEventListener("pause",          tryPlay);

    void v.play().then(onReady).catch(() => setSource(null));

    // Watchdog: if currentTime stops advancing for 2 s, the stream has
    // silently stalled — retry play() to wake it up.
    let lastTime = -1;
    const watchdog = window.setInterval(() => {
      if (v.paused || v.ended) { tryPlay(); return; }
      if (v.currentTime === lastTime) {
        tryPlay();
      }
      lastTime = v.currentTime;
    }, 2000);

    return () => {
      clearInterval(watchdog);
      v.removeEventListener("loadedmetadata", onReady);
      v.removeEventListener("canplay",        onReady);
      v.removeEventListener("playing",        onReady);
      v.removeEventListener("stalled",        tryPlay);
      v.removeEventListener("suspend",        tryPlay);
      v.removeEventListener("pause",          tryPlay);
      v.pause();
      v.srcObject = null;
      setSource(null);
    };
  }, [mediaStream]);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <video ref={videoRef} autoPlay muted playsInline
        style={{ position: "absolute", opacity: 0, width: 1, height: 1, pointerEvents: "none" }} />
      <AsciiCanvas source={source} editor={editor} onFps={onFps} />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function PreviewCanvas({ editor, uploadedImageUrl, mediaStream, onFps }: PreviewCanvasProps) {
  const mode =
    editor.sourceTab === "LIVE CAM" && mediaStream ? "webcam" :
    editor.sourceTab === "IMAGE/VIDEO" && uploadedImageUrl ? "image" :
    "placeholder";

  const [imgEl, setImgEl] = useState<HTMLImageElement | null>(null);

  // No fallback image, wait for upload
  const effectiveUrl = uploadedImageUrl;

  useEffect(() => {
    if (mode === "webcam") { setImgEl(null); return; }
    let cancelled = false;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload  = () => { if (!cancelled) setImgEl(img); };
    img.onerror = () => { if (!cancelled) setImgEl(null); };
    img.src = effectiveUrl;
    return () => { cancelled = true; img.onload = null; img.onerror = null; };
  }, [effectiveUrl, mode]);

  const cssGlow = editor.borderGlow > 0
    ? `0 0 ${Math.round(editor.borderGlow * 30)}px ${editor.fgColor}`
    : "none";

  if (mode === "webcam") {
    return (
      <div style={{ width: "100%", height: "100%", position: "relative", boxShadow: cssGlow }}>
        <WebcamAscii mediaStream={mediaStream!} editor={editor} onFps={onFps} />
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: "100%", position: "relative", boxShadow: cssGlow }}>
      <AsciiCanvas source={imgEl} editor={editor} onFps={onFps} />
    </div>
  );
}
