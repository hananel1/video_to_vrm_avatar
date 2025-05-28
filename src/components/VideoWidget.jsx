import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import {
  FACEMESH_TESSELATION,
  HAND_CONNECTIONS,
  Holistic,
  POSE_CONNECTIONS,
} from "@mediapipe/holistic";
import { useEffect, useRef, useState } from "react";
import { useVideoRecognition } from "../hooks/useVideoRecognition";

export const VideoWidget = ({ videoSrc }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoElement = useRef();
  const drawCanvas = useRef();
  const setVideoElement = useVideoRecognition((state) => state.setVideoElement);

  const drawResults = (results) => {
    if (!drawCanvas.current || !videoElement.current) return;
    
    drawCanvas.current.width = videoElement.current.videoWidth;
    drawCanvas.current.height = videoElement.current.videoHeight;
    let canvasCtx = drawCanvas.current.getContext("2d");
    canvasCtx.save();
    canvasCtx.clearRect(
      0,
      0,
      drawCanvas.current.width,
      drawCanvas.current.height
    );
    // Use `Mediapipe` drawing functions
    drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {
      color: "#00cff7",
      lineWidth: 4,
    });
    drawLandmarks(canvasCtx, results.poseLandmarks, {
      color: "#ff0364",
      lineWidth: 2,
    });
    drawConnectors(canvasCtx, results.faceLandmarks, FACEMESH_TESSELATION, {
      color: "#C0C0C070",
      lineWidth: 1,
    });
    if (results.faceLandmarks && results.faceLandmarks.length === 478) {
      //draw pupils
      drawLandmarks(
        canvasCtx,
        [results.faceLandmarks[468], results.faceLandmarks[468 + 5]],
        {
          color: "#ffe603",
          lineWidth: 2,
        }
      );
    }
    drawConnectors(canvasCtx, results.leftHandLandmarks, HAND_CONNECTIONS, {
      color: "#eb1064",
      lineWidth: 5,
    });
    drawLandmarks(canvasCtx, results.leftHandLandmarks, {
      color: "#00cff7",
      lineWidth: 2,
    });
    drawConnectors(canvasCtx, results.rightHandLandmarks, HAND_CONNECTIONS, {
      color: "#22c3e3",
      lineWidth: 5,
    });
    drawLandmarks(canvasCtx, results.rightHandLandmarks, {
      color: "#ff0364",
      lineWidth: 2,
    });
  };

  useEffect(() => {
    // Reset playing state when video source changes
    setIsPlaying(false);
    
    if (!videoSrc) {
      setVideoElement(null);
      return;
    }

    // Load the new video
    if (videoElement.current) {
      videoElement.current.src = videoSrc;
      videoElement.current.load();
    }
  }, [videoSrc]);

  useEffect(() => {
    if (!isPlaying || !videoSrc) {
      setVideoElement(null);
      return;
    }

    if (useVideoRecognition.getState().videoElement) {
      return;
    }

    setVideoElement(videoElement.current);
    const holistic = new Holistic({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic@0.5.1635989137/${file}`;
      },
    });

    holistic.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7,
      refineFaceLandmarks: true,
    });

    holistic.onResults((results) => {
      drawResults(results);
      useVideoRecognition.getState().resultsCallback?.(results);
    });

    // Process video frames
    const processFrame = async () => {
      if (videoElement.current && !videoElement.current.paused) {
        await holistic.send({ image: videoElement.current });
        requestAnimationFrame(processFrame);
      }
    };

    // Start processing when video plays
    const playHandler = () => {
      processFrame();
    };

    videoElement.current.addEventListener('play', playHandler);

    return () => {
      if (videoElement.current) {
        videoElement.current.removeEventListener('play', playHandler);
      }
    };
  }, [isPlaying, videoSrc]);

  const togglePlayback = () => {
    if (videoElement.current) {
      if (isPlaying) {
        videoElement.current.pause();
      } else {
        videoElement.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <>
      <button
        onClick={togglePlayback}
        className={`fixed bottom-4 right-4 cursor-pointer ${
          isPlaying
            ? "bg-red-500 hover:bg-red-700"
            : "bg-indigo-400 hover:bg-indigo-700"
        } transition-colors duration-200 flex items-center justify-center z-20 p-4 rounded-full text-white drop-shadow-sm`}
      >
        {!isPlaying ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 5.25v13.5m-7.5-13.5v13.5"
            />
          </svg>
        )}
      </button>
      <div
        className={`absolute z-[999999] bottom-24 right-4 w-[320px] h-[240px] rounded-[20px] overflow-hidden ${
          !isPlaying ? "hidden" : ""
        }`}
        width={640}
        height={480}
      >
        <canvas
          ref={drawCanvas}
          className="absolute z-10 w-full h-full bg-black/50 top-0 left-0"
        />
        <video
          ref={videoElement}
          className="absolute z-0 w-full h-full top-0 left-0"
        />
      </div>
    </>
  );
}; 