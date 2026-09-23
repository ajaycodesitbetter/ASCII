import { useState, useEffect, useRef, Component, ReactNode } from "react";
import portraitSource from "figma:asset/IMG_20260514_210558.jpg";
import { Sidebar, CHAR_SETS } from "./components/Sidebar";
import type { EditorState } from "./components/Sidebar";
import { PreviewCanvas } from "./components/PreviewCanvas";
import { ExportPanel, buildRandomPatch } from "./components/ExportPanel";
import { ArrowDownToLine, Expand, X } from "lucide-react";

// ─── Error boundary ───────────────────────────────────────────────────────────
interface EBState { hasError: boolean; message: string }
class ErrorBoundary extends Component<{ children: ReactNode }, EBState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, message: "" };
  }
  static getDerivedStateFromError(error: Error): EBState {
    return { hasError: true, message: error?.message ?? "Unknown error" };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ background: "#000", color: "#888", padding: 32, fontFamily: "DM Mono, monospace", fontSize: 13, height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
          <div style={{ color: "#C8B400", letterSpacing: "0.15em", fontSize: 10, textTransform: "uppercase", marginBottom: 8 }}>Error</div>
          <div>{this.state.message}</div>
          <button onClick={() => window.location.reload()} style={{ color: "#C8B400", textDecoration: "underline", cursor: "pointer", background: "none", border: "none", fontFamily: "DM Mono, monospace", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── Default editor state ─────────────────────────────────────────────────────
const defaultEditor: EditorState = {
  sourceTab:        "IMAGE/VIDEO",
  quality:          "480",
  characters:       CHAR_SETS["Standard"],
  charSetKey:       "Standard",
  customCharacters: "",
  artStyle:         "Classic ASCII",
  fontFamily:       "Helvetica Neue",
  fontSize:         8,
  charSpacing:      1.0,
  brightness:       0,
  contrast:         1.1,
  ditherAlgorithm:  "Floyd-Steinberg",
  ditherStrength:   1.0,
  bgDither:         0,
  invDither:        0,
  colorMode:        "Grayscale",
  fgColor:          "#ffffff",
  bgColor:          "#000000",
  invert:           false,
  customFgColor:    "#ffffff",
  customBgColor:    "#000000",
  vignette:         0,
  borderGlow:       0,
  opacity:          1,
  fxPreset:         "None",
  fxStrength:       0.45,
  direction:        "up",
  noiseScale:       24,
  noiseSpeed:       1,
  mouseMode:        "Attract",
  hoverStrength:    24,
  areaSize:         180,
  spread:           1,
};

// ─── App ──────────────────────────────────────────────────────────────────────
// Grid quality has a single source of truth: editor.quality (see AsciiCanvas).
export default function App() {
  const [editor, setEditor] = useState<EditorState>(defaultEditor);
  const [uploadedImageUrl, setUploadedImageUrl]     = useState<string | null>(portraitSource);
  const [uploadedFilename, setUploadedFilename]     = useState<string | null>("IMG_20260514_210558.jpg");
  const [uploadError, setUploadError]               = useState<string | null>(null);
  const [mediaStream, setMediaStream]               = useState<MediaStream | null>(null);
  const [webcamActive, setWebcamActive]             = useState(false);
  const [webcamPending, setWebcamPending]           = useState(false);
  const [webcamError, setWebcamError]               = useState<string | null>(null);
  const [exportOpen, setExportOpen]                 = useState(false);
  const [fullscreen, setFullscreen]                 = useState(false);
  const [fpsDisplay, setFpsDisplay]                 = useState(0);
  const cameraRequestRef  = useRef(0);
  const workspaceRef      = useRef<HTMLDivElement>(null);
  const toggleFsRef       = useRef<() => Promise<void>>(async () => undefined);

  // ── File upload ──────────────────────────────────────────────────────────────
  const handleFileUpload = (url: string, filename: string) => {
    if (filename === "__ERROR__1MB limit exceeded") { setUploadError("File exceeds 1 MB upload limit"); return; }
    if (uploadedImageUrl && uploadedImageUrl.startsWith("blob:")) URL.revokeObjectURL(uploadedImageUrl);
    setUploadedImageUrl(url); setUploadedFilename(filename); setUploadError(null);
    setEditor(prev => ({ ...prev, sourceTab: "IMAGE/VIDEO" }));
  };

  // ── Webcam ────────────────────────────────────────────────────────────────────
  const stopWebcam = () => {
    cameraRequestRef.current += 1;
    mediaStream?.getTracks().forEach(t => t.stop());
    setMediaStream(null); setWebcamActive(false); setWebcamPending(false);
  };
  const handleWebcamToggle = async () => {
    if (webcamActive || mediaStream || webcamPending) { stopWebcam(); return; }
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) { setWebcamError("Camera requires HTTPS or localhost"); return; }
    const reqId = cameraRequestRef.current + 1; cameraRequestRef.current = reqId;
    setWebcamError(null); setWebcamPending(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      if (cameraRequestRef.current !== reqId) { stream.getTracks().forEach(t => t.stop()); return; }
      setMediaStream(stream); setWebcamActive(true); setWebcamPending(false);
    } catch (err) {
      if (cameraRequestRef.current !== reqId) return;
      const name = err instanceof DOMException ? err.name : "";
      setWebcamError(
        name === "NotAllowedError"  ? "Camera permission denied" :
        name === "NotFoundError"    ? "No camera found" :
        name === "NotReadableError" ? "Camera busy in another app" : "Unable to start camera"
      );
      setWebcamActive(false); setWebcamPending(false);
    }
  };
  useEffect(() => () => { cameraRequestRef.current += 1; mediaStream?.getTracks().forEach(t => t.stop()); }, [mediaStream]);

  // ── Fullscreen ────────────────────────────────────────────────────────────────
  const toggleFullscreen = async () => {
    if (document.fullscreenElement) { await document.exitFullscreen?.(); return; }
    try { await workspaceRef.current?.requestFullscreen?.(); } catch { setFullscreen(f => !f); }
  };
  toggleFsRef.current = toggleFullscreen;
  useEffect(() => {
    const sync = () => setFullscreen(document.fullscreenElement === workspaceRef.current);
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);

  // ── Keyboard shortcuts ────────────────────────────────────────────────────────
  useEffect(() => {
    const keydown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "f" && !(e.target instanceof HTMLInputElement))
        void toggleFsRef.current();
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "e")
        { e.preventDefault(); setExportOpen(true); }
    };
    window.addEventListener("keydown", keydown);
    return () => window.removeEventListener("keydown", keydown);
  }, []);

  // ── Export: download PNG ──────────────────────────────────────────────────────
  const handleDownloadImage = (format: string, scaleFactor = 1, transparent = false) => {
    const canvases = Array.from(document.querySelectorAll("canvas")) as HTMLCanvasElement[];
    const target   = canvases[canvases.length - 1];
    if (!target) return;
    try {
      const outW = Math.round(target.width * scaleFactor);
      const outH = Math.round(target.height * scaleFactor);
      const out  = document.createElement("canvas");
      out.width  = outW; out.height = outH;
      const ctx  = out.getContext("2d")!;
      if (transparent && (format === "png" || format === "webp"))
        ctx.clearRect(0, 0, outW, outH);
      ctx.drawImage(target, 0, 0, outW, outH);
      const a    = document.createElement("a");
      const mime = format === "jpeg" ? "image/jpeg" : `image/${format}`;
      a.href     = out.toDataURL(mime, 0.95);
      a.download = `ascii-export.${format}`;
      a.click();
    } catch { /* canvas may be tainted by cross-origin source */ }
  };

  // ── Export preset / random ────────────────────────────────────────────────────
  const handleApplyPreset = (patch: Partial<EditorState>) => setEditor(prev => ({ ...prev, ...patch }));
  const handleRandom      = () => setEditor(prev => ({ ...prev, ...buildRandomPatch() }));

  // ── Header source label ───────────────────────────────────────────────────────
  const sourceLabel = editor.sourceTab === "LIVE CAM"
    ? "LIVE CAMERA"
    : uploadedFilename ?? "NO SOURCE";

  const fpsColor = fpsDisplay >= 50 ? "#85bf90" : fpsDisplay >= 30 ? "#d8b761" : "#d87b61";

  return (
    <ErrorBoundary>
      <style>{`
        html,body,#root{height:100%;overflow:hidden;background:#050505}
        .ascii-checker{background-color:#080808;background-image:linear-gradient(45deg,#0d0d0d 25%,transparent 25%),linear-gradient(-45deg,#0d0d0d 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#0d0d0d 75%),linear-gradient(-45deg,transparent 75%,#0d0d0d 75%);background-size:16px 16px;background-position:0 0,0 8px,8px -8px,-8px 0}
        @media(max-width:900px){.app-sidebar{width:260px!important}}
        @media(max-width:620px){.app-sidebar{display:none}.app-title{display:none}}
      `}</style>

      <div style={{ height: "100%", background: "#050505", fontFamily: "DM Mono, monospace", color: "#e7e7e2", display: "flex", flexDirection: "column" }}>

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <header style={{ flexShrink: 0, height: 48, display: "flex", alignItems: "center", borderBottom: "1px solid #2a2a28", background: "#080808", padding: "0 12px", gap: 12 }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, paddingRight: 16, borderRight: "1px solid #292927", marginRight: 4 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2, border: "1px solid #c8b400", padding: 3, width: 24, height: 24 }}>
              {Array.from({ length: 9 }).map((_, i) => (
                <span key={i} style={{ background: (i === 0 || i === 4 || i === 8) ? "#e8d528" : "#4a481f" }} />
              ))}
            </div>
            <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: "0.16em", color: "#f2f2ea" }}>ASCII</span>
          </div>

          {/* Source label */}
          <span className="app-title" style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "#888", minWidth: 0 }}>
            <span style={{ color: "#c7c7bd" }}>{sourceLabel}</span>
          </span>

          {/* Right side */}
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
            {/* FPS chip */}
            <div style={{ display: "flex", alignItems: "center", height: 28, border: "1px solid #294631", background: "#0d130e", padding: "0 8px", gap: 8, fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: fpsColor, whiteSpace: "nowrap" }}>
              <span style={{ fontWeight: 700 }}>FPS {fpsDisplay || "—"}</span>
              <span style={{ borderLeft: "1px solid #294631", paddingLeft: 8, color: "#85bf90" }}>
                {editor.quality}P
              </span>
            </div>

            {/* Reset */}
            <button
              onClick={() => setEditor(defaultEditor)}
              title="Reset editor"
              style={{ height: 28, width: 28, display: "grid", placeItems: "center", border: "1px solid transparent", background: "transparent", color: "#777", cursor: "pointer", transition: "all 0.12s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#303030"; (e.currentTarget as HTMLButtonElement).style.color = "#ddd"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "#777"; }}
            >
              ↺
            </button>

            {/* Export */}
            <button
              onClick={() => setExportOpen(true)}
              style={{ height: 28, display: "flex", alignItems: "center", gap: 6, border: "1px solid #c8b400", background: "#c8b400", padding: "0 10px", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#000", cursor: "pointer", fontFamily: "DM Mono, monospace", transition: "background 0.12s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#e3d32a"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "#c8b400"; }}
            >
              <ArrowDownToLine size={13} /> Export
            </button>
          </div>
        </header>

        {/* ── Main ────────────────────────────────────────────────────────────── */}
        <main style={{ flex: 1, minHeight: 0, display: "flex", overflow: "hidden" }}>
          {/* Sidebar */}
          <Sidebar
            editor={editor}
            setEditor={setEditor}
            onFileUpload={handleFileUpload}
            onWebcamToggle={handleWebcamToggle}
            onAddLayer={() => undefined}
            uploadedFilename={uploadedFilename}
            uploadError={uploadError}
            webcamActive={webcamActive}
            webcamPending={webcamPending}
            webcamError={webcamError}
          />

          {/* Canvas workspace */}
          <section ref={workspaceRef} style={{ flex: 1, minWidth: 0, position: "relative", background: "#000", overflow: "hidden" }}>
            <div className="ascii-checker" style={{ position: "absolute", inset: 0, opacity: 0.4 }} />

            {/* HUD overlay */}
            <div style={{ position: "absolute", left: 12, top: 12, zIndex: 20, display: "flex", background: "rgba(8,8,8,0.92)", border: "1px solid #3a3a36", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.12em", color: "#8e8c82", userSelect: "none" }}>
              {[
                editor.sourceTab === "LIVE CAM" ? "CAM" : "IMAGE",
                `${editor.quality}P`,
                editor.ditherAlgorithm,
                editor.fxPreset,
              ].map((s, i) => (
                <span key={i} style={{ padding: "5px 8px", borderLeft: i > 0 ? "1px solid #3a3a36" : "none" }}>{s}</span>
              ))}
            </div>

            {/* Canvas container */}
            <div style={{ position: "relative", zIndex: 10, height: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
              <div style={{
                position: "relative",
                aspectRatio: "16/9",
                width: "100%", maxWidth: 1200,
                overflow: "hidden",
                border: "1px solid #45443d",
                background: "#000",
              }}>
                <PreviewCanvas
                  editor={editor}
                  uploadedImageUrl={uploadedImageUrl}
                  mediaStream={mediaStream}
                  onFps={setFpsDisplay}
                />
                {/* Inner border guide */}
                <div style={{ pointerEvents: "none", position: "absolute", inset: 16, border: "1px solid rgba(255,255,255,0.1)" }} />
              </div>
            </div>

            {/* Bottom-right controls */}
            <div style={{ position: "absolute", bottom: 12, right: 12, zIndex: 20, display: "flex", border: "1px solid #3a3a36", background: "rgba(8,8,8,0.95)" }}>
              <button
                onClick={() => void toggleFullscreen()}
                title="Fullscreen (F)"
                style={{ width: 28, height: 28, display: "grid", placeItems: "center", border: "none", background: "transparent", color: "#a09e93", cursor: "pointer" }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "#fff"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "#a09e93"; }}
              >
                <Expand size={14} />
              </button>
            </div>

            {/* Fullscreen close button */}
            {fullscreen && (
              <button
                onClick={() => void toggleFullscreen()}
                style={{ position: "absolute", right: 16, top: 16, zIndex: 60, border: "1px solid #444", background: "#000", padding: 8, color: "#aaa", cursor: "pointer" }}
              >
                <X size={16} />
              </button>
            )}
          </section>
        </main>

        {/* ── Footer ─────────────────────────────────────────────────────────── */}
        <footer style={{ flexShrink: 0, height: 28, display: "flex", alignItems: "center", gap: 16, borderTop: "1px solid #2a2a28", background: "#0a0a0a", padding: "0 12px", fontSize: 8, textTransform: "uppercase", letterSpacing: "0.1em", color: "#737269", overflow: "hidden" }}>
          <span style={{ color: "#b4b2a7" }}>{uploadedFilename ?? "No source"}</span>
          <span>Quality {editor.quality}P</span>
          <span>{editor.artStyle}</span>
          <span>{editor.ditherAlgorithm}</span>
          <span style={{ marginLeft: "auto", color: fpsColor }}>
            {fpsDisplay ? `${fpsDisplay} FPS` : "—"}
          </span>
        </footer>
      </div>

      {/* ── Export panel ─────────────────────────────────────────────────────── */}
      <ExportPanel
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        editor={editor}
        onApplyPreset={handleApplyPreset}
        onRandom={handleRandom}
        onDownloadImage={handleDownloadImage}
      />
    </ErrorBoundary>
  );
}
