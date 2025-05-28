import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import {
  FACEMESH_TESSELATION,
  HAND_CONNECTIONS,
  Holistic,
  POSE_CONNECTIONS,
} from "@mediapipe/holistic";
import { useEffect, useRef, useState } from "react";
import { useVideoRecognition } from "../hooks/useVideoRecognition";

export const VideoControls = ({ videoSrc }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [landmarkData, setLandmarkData] = useState([]);
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
    // Reset states when video source changes
    setIsPlaying(false);
    setIsRecording(false);
    setLandmarkData([]);
    
    if (!videoSrc) {
      setVideoElement(null);
      return;
    }

    // Load the new video
    if (videoElement.current) {
      videoElement.current.src = videoSrc;
      videoElement.current.load();
    }

    // Cleanup URL when component unmounts or video changes
    return () => {
      if (videoSrc.startsWith('blob:')) {
        URL.revokeObjectURL(videoSrc);
      }
    };
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
      
      if (isRecording) {
        // Save landmark data with timestamp
        const frameData = {
          timestamp: videoElement.current.currentTime,
          faceLandmarks: results.faceLandmarks,
          poseLandmarks: results.poseLandmarks,
          leftHandLandmarks: results.leftHandLandmarks,
          rightHandLandmarks: results.rightHandLandmarks,
        };
        setLandmarkData(prev => [...prev, frameData]);
      }
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
  }, [isPlaying, videoSrc, isRecording]);

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

  const toggleRecording = () => {
    if (isRecording) {
      // Stop recording and save data
      const fileName = `landmark-data-${new Date().toISOString()}.json`;
      const jsonString = JSON.stringify(landmarkData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setLandmarkData([]); // Clear the data after saving
    }
    setIsRecording(!isRecording);
  };

  if (!videoSrc) return null;

  return (
    <div className="fixed bottom-0 right-0 p-4 z-50">
      <div className="flex flex-col items-end gap-4">
        <div className="flex gap-2">
          <button
            onClick={togglePlayback}
            className={`cursor-pointer ${
              isPlaying
                ? "bg-red-500 hover:bg-red-700"
                : "bg-indigo-400 hover:bg-indigo-700"
            } transition-colors duration-200 flex items-center justify-center p-4 rounded-full text-white drop-shadow-sm`}
          >
            {!isPlaying ? (
              <span className="material-icons">play_arrow</span>
            ) : (
              <span className="material-icons">pause</span>
            )}
          </button>
          <button
            onClick={toggleRecording}
            className={`cursor-pointer ${
              isRecording
                ? "bg-red-500 hover:bg-red-700"
                : "bg-green-500 hover:bg-green-700"
            } transition-colors duration-200 flex items-center justify-center p-4 rounded-full text-white drop-shadow-sm`}
          >
            <span className="material-icons">
              {isRecording ? "stop" : "fiber_manual_record"}
            </span>
          </button>
        </div>
        <div
          className={`w-[320px] h-[240px] rounded-[20px] overflow-hidden bg-black ${
            !isPlaying ? "opacity-50" : ""
          }`}
        >
          <canvas
            ref={drawCanvas}
            className="absolute z-10 w-[320px] h-[240px]"
          />
          <video
            ref={videoElement}
            className="absolute z-0 w-[320px] h-[240px] object-cover"
          />
        </div>
        {isRecording && (
          <div className="text-sm text-white bg-red-500 px-3 py-1 rounded-full">
            Recording landmarks... ({landmarkData.length} frames)
          </div>
        )}
      </div>
    </div>
  );
}; 