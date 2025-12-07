/**
 * Shared view panel for screen and camera preview
 */

import { useEffect, useRef } from "react";

interface MediaPreviewProps {
  label: string;
  stream: MediaStream | null;
  placeholder: string;
}

interface SharedViewPanelProps {
  isScreenSharing: boolean;
  isCameraOn: boolean;
  screenStream: MediaStream | null;
  cameraStream: MediaStream | null;
  onStartScreen: () => Promise<MediaStream | null>;
  onStopScreen: () => void;
  onStartCamera: () => Promise<MediaStream | null>;
  onStopCamera: () => void;
  error?: string | null;
}

const containerStyle = {
  backgroundColor: "#000",
  color: "#fff",
  border: "2px solid #fff",
  padding: "1rem",
  display: "flex",
  flexDirection: "column" as const,
  gap: "0.75rem",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "0.75rem",
};

const actionRowStyle = { display: "flex", gap: "0.5rem" };
const gridStyle = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" };
const previewContainerStyle = {
  border: "1px solid #333",
  borderRadius: "8px",
  padding: "0.5rem",
  backgroundColor: "#0b0b0b",
  display: "flex",
  flexDirection: "column" as const,
  gap: "0.5rem",
};

const labelStyle = { color: "#aaa", fontSize: "0.9rem", fontWeight: 600 };

const videoStyle = {
  width: "100%",
  borderRadius: "6px",
  border: "1px solid #222",
  backgroundColor: "#000",
  aspectRatio: "16 / 9",
  objectFit: "cover" as const,
};

const placeholderStyle = {
  borderRadius: "6px",
  border: "1px dashed #333",
  backgroundColor: "#000",
  color: "#555",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: "160px",
  fontSize: "0.9rem",
};

const buttonStyle = (color: string) => ({
  backgroundColor: "#000",
  color,
  border: `1px solid ${color}`,
  padding: "0.5rem 0.9rem",
  cursor: "pointer",
  fontWeight: "bold",
});

const titleStyle = { fontSize: "1.1rem", fontWeight: 600 };
const errorStyle = { color: "#ff7373", fontSize: "0.9rem" };

function MediaPreview({ label, stream, placeholder }: MediaPreviewProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!stream) { video.pause(); video.srcObject = null; return; }
    video.srcObject = stream; video.play().catch(() => {});
  }, [stream]);

  const content = stream ? (
    <video ref={videoRef} muted autoPlay playsInline style={videoStyle} />
  ) : (
    <div style={placeholderStyle}>{placeholder}</div>
  );

  return (
    <div style={previewContainerStyle}>
      <div style={labelStyle}>{label}</div>
      {content}
    </div>
  );
}

function ShareControls({
  isScreenSharing,
  isCameraOn,
  onStartScreen,
  onStopScreen,
  onStartCamera,
  onStopCamera,
}: Pick<
  SharedViewPanelProps,
  "isScreenSharing" | "isCameraOn" | "onStartScreen" | "onStopScreen" | "onStartCamera" | "onStopCamera"
>) {
  const screenLabel = isScreenSharing ? "Stop screen share" : "Share your screen";
  const cameraLabel = isCameraOn ? "Turn camera off" : "Show camera";

  return (
    <div style={headerStyle}>
      <div style={titleStyle}>Shared view</div>
      <div style={actionRowStyle}>
        <button
          onClick={isScreenSharing ? onStopScreen : onStartScreen}
          style={buttonStyle(isScreenSharing ? "#ff4d4f" : "#0ff")}
        >
          {screenLabel}
        </button>
        <button
          onClick={isCameraOn ? onStopCamera : onStartCamera}
          style={buttonStyle(isCameraOn ? "#ff4d4f" : "#0f0")}
        >
          {cameraLabel}
        </button>
      </div>
    </div>
  );
}

function PreviewGrid({
  screenStream,
  cameraStream,
}: Pick<SharedViewPanelProps, "screenStream" | "cameraStream">) {
  return (
    <div style={gridStyle}>
      <MediaPreview
        label="Screen"
        stream={screenStream}
        placeholder="No screen is currently shared"
      />
      <MediaPreview label="Camera" stream={cameraStream} placeholder="Camera is not active" />
    </div>
  );
}

export function SharedViewPanel({
  isScreenSharing,
  isCameraOn,
  screenStream,
  cameraStream,
  onStartScreen,
  onStopScreen,
  onStartCamera,
  onStopCamera,
  error,
}: SharedViewPanelProps) {
  return (
    <div style={containerStyle}>
      <ShareControls
        isScreenSharing={isScreenSharing}
        isCameraOn={isCameraOn}
        onStartScreen={onStartScreen}
        onStopScreen={onStopScreen}
        onStartCamera={onStartCamera}
        onStopCamera={onStopCamera}
      />
      {error && <div style={errorStyle}>{error}. Check permissions and try again.</div>}
      <PreviewGrid screenStream={screenStream} cameraStream={cameraStream} />
    </div>
  );
}
