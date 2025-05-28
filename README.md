# R3F VRM Avatar Animation System

This project is a React Three Fiber (R3F) based VRM avatar animation system that supports both live video input and recorded motion data playback. The system uses MediaPipe for real-time motion tracking and can record and replay facial expressions, body poses, and hand movements.

## Features

### 1. Live Video Input
- Real-time facial, body, and hand tracking using MediaPipe
- Support for webcam input
- Support for video file playback
- Live preview window with tracking visualization
- Play/pause controls for video input

### 2. Motion Recording
You can record motion data from either live webcam or video file input:
1. Start by selecting a video file using the "Select Video" button in the Leva UI
2. The video preview will appear in the bottom-right corner
3. Use the play/pause button to control video playback
4. Motion data is automatically tracked and can be saved

### 3. Landmark Recording and Playback
The system supports saving and loading motion data:

#### Recording Landmarks
1. Load a video using the "Select Video" button
2. Play the video to start recording landmarks
3. The recorded data includes:
   - Facial landmarks (478 points)
   - Body pose landmarks
   - Left and right hand landmarks
   - Timestamp data for accurate playback

#### Playing Back Recorded Landmarks
1. Click "Load Landmarks" in the Leva UI
2. Select a previously saved landmark JSON file
3. Use the Landmark Playback controls in Leva UI:
   - Play/Pause: Toggle playback
   - Reset: Return to start
   - Playback Speed: Adjust from 0.1x to 2x speed

### 4. VRM Avatar Selection
- Multiple VRM avatars available
- Switch between avatars using the Leva UI
- Avatars respond to both live and recorded motion data

## Controls

### Video Controls
- Play/Pause button in bottom-right corner
- Video preview window shows tracking visualization

### Leva UI Controls

#### Input Source Panel
- **Select Video**: Load a video file for tracking
- **Load Landmarks**: Import previously recorded landmark data
- **Clear All**: Reset all inputs and playback

#### VRM Panel
- **Avatar**: Select different VRM models
- **Playback Speed**: Adjust landmark playback speed (0.1x to 2x)

#### Landmark Playback Panel
- **Play/Pause**: Control landmark playback
- **Reset**: Return to start of recording

## Technical Details

### Landmark Data Format
The recorded landmark JSON files contain:
```javascript
[
  {
    "timestamp": number,
    "faceLandmarks": [...],     // 478 facial landmarks
    "poseLandmarks": [...],     // 33 body pose landmarks
    "leftHandLandmarks": [...], // 21 hand landmarks
    "rightHandLandmarks": [...] // 21 hand landmarks
  },
  // ... more frames
]
```

### Performance Considerations
- Video tracking runs at 30fps
- Landmark playback maintains original timing
- Adjustable playback speed without affecting animation quality

## Best Practices
1. For best tracking results:
   - Ensure good lighting
   - Keep face and body visible
   - Avoid rapid movements
2. When recording landmarks:
   - Use high-quality video input
   - Maintain consistent frame rate
   - Save recordings for future use
3. For playback:
   - Start with 1x speed for natural movement
   - Use speed controls to analyze motion in detail
   - Reset playback when switching files

## Troubleshooting
1. If VRM avatar doesn't move:
   - Check if landmark data is loaded (see console logs)
   - Verify playback controls are active
   - Ensure landmark file contains all required data
2. If video tracking is slow:
   - Reduce video resolution
   - Close other resource-intensive applications
   - Check system performance
3. If landmarks are jittery:
   - Ensure stable lighting
   - Reduce background movement
   - Check video quality

[Video Tutorial](https://www.youtube.com/watch?v=6MP48RFhe2Y)

![vrm-avatar-thumbnail](https://github.com/user-attachments/assets/29e8ea14-56c0-47af-a632-55f09a571d6c)

[Demo](https://vrm.wawasensei.dev/) - [Starter Pack](https://github.com/wass08/r3f-vrm-starter)

