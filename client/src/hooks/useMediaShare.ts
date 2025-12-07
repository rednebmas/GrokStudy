/**
 * Screen and camera sharing hook
 */

import { useCallback, useEffect, useState,  } from "react";

interface MediaShareState {
  screenStream: MediaStream | null;
  cameraStream: MediaStream | null;
  error: string | null;
}

const stopStream = (stream: MediaStream | null) => {
  stream?.getTracks().forEach((track) => track.stop());
};

const captureFrameFromStream = async (stream: MediaStream | null): Promise<string | null> => {
  if (!stream) return null;
  const [track] = stream.getVideoTracks();
  if (!track) return null;

  try {
    // @ts-ignore - ImageCapture is not fully typed in all environments
    const capture = new ImageCapture(track);
    const videoFrame = await (capture as any).grabFrame();
    const bitmap = await createImageBitmap(videoFrame);
    videoFrame.close();

    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;

    const context = canvas.getContext("2d");
    if (!context) return null;

    context.drawImage(bitmap, 0, 0);
    return canvas.toDataURL("image/jpeg", 0.7);
  } catch (error) {
    console.error("Error capturing frame:", error);
    return null;
  }
};

const addStopListeners = (stream: MediaStream, stop: () => void) => {
  stream.getVideoTracks().forEach((track) => {
    track.addEventListener("ended", stop, { once: true });
  });
};

export function useMediaShare() {
  const [state, setState] = useState<MediaShareState>({
    screenStream: null,
    cameraStream: null,
    error: null,
  });

  const stopScreenShare = useCallback(() => {
    stopStream(state.screenStream);
    setState((prev) => ({ ...prev, screenStream: null }));
  }, [state.screenStream]);

  const stopCamera = useCallback(() => {
    stopStream(state.cameraStream);
    setState((prev) => ({ ...prev, cameraStream: null }));
  }, [state.cameraStream]);

  const startScreenShare = useCallback(async () => {
    if (state.screenStream) return state.screenStream;

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      addStopListeners(stream, stopScreenShare);

      setState((prev) => ({
        ...prev,
        screenStream: stream,
        error: null,
      }));

      return stream;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unable to start screen share";
      setState((prev) => ({ ...prev, error: errorMessage }));
      throw error;
    }
  }, [state.screenStream, stopScreenShare]);

  const startCamera = useCallback(async () => {
    if (state.cameraStream) return state.cameraStream;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      addStopListeners(stream, stopCamera);

      setState((prev) => ({
        ...prev,
        cameraStream: stream,
        error: null,
      }));

      return stream;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unable to access camera";
      setState((prev) => ({ ...prev, error: errorMessage }));
      throw error;
    }
  }, [state.cameraStream, stopCamera]);

  const captureFrame = useCallback(
    (source: "screen" | "camera") => {
      const target = source === "screen" ? state.screenStream : state.cameraStream;
      return captureFrameFromStream(target);
    },
    [state.screenStream, state.cameraStream],
  );

  useEffect(() => {
    return () => {
      stopScreenShare();
      stopCamera();
    };
  }, [stopScreenShare, stopCamera]);

  return {
    screenStream: state.screenStream,
    cameraStream: state.cameraStream,
    isScreenSharing: Boolean(state.screenStream),
    isCameraOn: Boolean(state.cameraStream),
    startScreenShare,
    stopScreenShare,
    startCamera,
    stopCamera,
    captureFrame,
    error: state.error,
  };
}