import { CameraControls, Environment, Gltf } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { useControls } from "leva";
import { useRef, useEffect } from "react";
import { VRMAvatar } from "./VRMAvatar";
import { useVideoRecognition } from "../hooks/useVideoRecognition";

export const Experience = ({ landmarkData, isPlayingRecorded }) => {
  const controls = useRef();
  const frameIndex = useRef(0);
  const animationFrameId = useRef();
  const lastFrameTime = useRef(0);
  const setResultsCallback = useVideoRecognition((state) => state.setResultsCallback);

  const { avatar, playbackSpeed } = useControls("VRM", {
    avatar: {
      value: "3859814441197244330.vrm",
      options: [
        "262410318834873893.vrm",
        "3859814441197244330.vrm",
        "3636451243928341470.vrm",
        "8087383217573817818.vrm",
      ],
    },
    playbackSpeed: {
      value: 1,
      min: 0.1,
      max: 2,
      step: 0.1,
      label: "Playback Speed",
    },
  });

  // Debug effect to log landmark data when it's loaded
  useEffect(() => {
    if (landmarkData) {
      console.log("Landmark data loaded:", {
        totalFrames: landmarkData.length,
        firstFrame: landmarkData[0],
        lastFrame: landmarkData[landmarkData.length - 1]
      });
    }
  }, [landmarkData]);

  useEffect(() => {
    if (!landmarkData || !isPlayingRecorded) {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      frameIndex.current = 0;
      lastFrameTime.current = 0;
      return;
    }

    console.log("Starting landmark playback:", {
      isPlaying: isPlayingRecorded,
      totalFrames: landmarkData.length
    });

    const animate = (timestamp) => {
      if (!lastFrameTime.current) lastFrameTime.current = timestamp;
      
      const deltaTime = timestamp - lastFrameTime.current;
      const currentFrame = landmarkData[frameIndex.current];
      
      if (currentFrame) {
        // Send the current frame data to the VRM avatar
        const results = {
          faceLandmarks: currentFrame.faceLandmarks,
          poseLandmarks: currentFrame.poseLandmarks,
          leftHandLandmarks: currentFrame.leftHandLandmarks,
          rightHandLandmarks: currentFrame.rightHandLandmarks,
          za: currentFrame.poseLandmarks ? { 
            width: 640, 
            height: 480 
          } : undefined
        };

        setResultsCallback(results);

        // Advance to next frame based on playback speed
        if (deltaTime >= (1000 / 30) / playbackSpeed) { // Aim for 30fps
          frameIndex.current = (frameIndex.current + 1) % landmarkData.length;
          lastFrameTime.current = timestamp;

          // Log every 30th frame for debugging
          if (frameIndex.current % 30 === 0) {
            console.log("Playback progress:", {
              frame: frameIndex.current,
              totalFrames: landmarkData.length,
              hasLandmarks: {
                face: !!results.faceLandmarks,
                pose: !!results.poseLandmarks,
                leftHand: !!results.leftHandLandmarks,
                rightHand: !!results.rightHandLandmarks
              }
            });
          }
        }
      }

      animationFrameId.current = requestAnimationFrame(animate);
    };

    frameIndex.current = 0;
    lastFrameTime.current = 0;
    animationFrameId.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [landmarkData, isPlayingRecorded, playbackSpeed, setResultsCallback]);

  return (
    <>
      <CameraControls
        ref={controls}
        maxPolarAngle={Math.PI / 2}
        minDistance={1}
        maxDistance={10}
      />
      <Environment preset="sunset" />
      <directionalLight intensity={2} position={[10, 10, 5]} />
      <directionalLight intensity={1} position={[-10, 10, 5]} />
      <group position-y={-1.25}>
        <VRMAvatar avatar={avatar} />
        <Gltf
          src="models/sound-stage-final.glb"
          position-z={-1.4}
          position-x={-0.5}
          scale={0.65}
        />
      </group>
      <EffectComposer>
        <Bloom mipmapBlur intensity={0.7} />
      </EffectComposer>
    </>
  );
};
