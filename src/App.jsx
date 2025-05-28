import { Canvas } from "@react-three/fiber";
import { Experience } from "./components/Experience";
import { Suspense, useState } from "react";
import { VideoControls } from "./components/VideoControls";
import { useControls, button } from "leva";

export default function App() {
  const [videoSrc, setVideoSrc] = useState("");

  useControls("Video", {
    "Select Video": button(() => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'video/mp4';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          const url = URL.createObjectURL(file);
          setVideoSrc(url);
        }
      };
      input.click();
    }),
    "Clear Video": button(() => {
      setVideoSrc("");
    })
  });

  return (
    <>
      <Canvas shadows camera={{ position: [0, 2, 5], fov: 30 }}>
        <color attach="background" args={["#ececec"]} />
        <Suspense fallback={null}>
          <Experience />
        </Suspense>
      </Canvas>
      <VideoControls videoSrc={videoSrc} />
    </>
  );
}
