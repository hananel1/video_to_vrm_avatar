import { Canvas } from "@react-three/fiber";
import { Experience } from "./components/Experience";
import { Suspense, useState } from "react";
import { VideoControls } from "./components/VideoControls";
import { useControls, button } from "leva";

export default function App() {
  const [videoSrc, setVideoSrc] = useState("");
  const [landmarkData, setLandmarkData] = useState(null);
  const [isPlayingRecorded, setIsPlayingRecorded] = useState(false);

  useControls("Input Source", {
    "Select Video": button(() => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'video/mp4';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          setLandmarkData(null); // Clear any loaded landmark data
          const url = URL.createObjectURL(file);
          setVideoSrc(url);
        }
      };
      input.click();
    }),
    "Load Landmarks": button(() => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
          try {
            const text = await file.text();
            const data = JSON.parse(text);
            setVideoSrc(""); // Clear any loaded video
            setLandmarkData(data);
          } catch (error) {
            console.error("Error loading landmark data:", error);
          }
        }
      };
      input.click();
    }),
    "Clear All": button(() => {
      setVideoSrc("");
      setLandmarkData(null);
      setIsPlayingRecorded(false);
    })
  });

  useControls("Landmark Playback", {
    "Play/Pause": button(() => {
      if (landmarkData) {
        setIsPlayingRecorded(!isPlayingRecorded);
      }
    }),
    "Reset": button(() => {
      setIsPlayingRecorded(false);
    })
  }, {
    collapsed: !landmarkData
  });

  return (
    <>
      <Canvas shadows camera={{ position: [0, 2, 5], fov: 30 }}>
        <color attach="background" args={["#ececec"]} />
        <Suspense fallback={null}>
          <Experience landmarkData={landmarkData} isPlayingRecorded={isPlayingRecorded} />
        </Suspense>
      </Canvas>
      {videoSrc && <VideoControls videoSrc={videoSrc} />}
    </>
  );
}
