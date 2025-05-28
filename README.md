# VRM Avatar with Video Input

This project allows you to animate a VRM avatar using video input. The avatar will mimic the movements of the person in the video.

## Setup

1. Place your video file in the `public/videos` directory
2. The video should contain a person with clearly visible:
   - Face (for facial expressions and head movement)
   - Upper body (for body movement)
   - Hands (for hand gestures)

## Usage

1. Start the development server:
```bash
npm run dev
```

2. In the control panel (top-right), you'll see two main controls:
   - `avatar`: Choose your VRM model
   - `videoSrc`: Enter the path to your video file (e.g., `/videos/your-video.mp4`)

3. Once you enter the video path, you'll see a video player in the bottom-right corner
4. Click the play button to start the video and the animation

## Tips for Best Results

- Use videos with good lighting
- The person should be clearly visible and facing the camera
- Movements should be relatively slow and clear
- The video resolution should be at least 640x480
- Supported format: MP4

[Video Tutorial](https://www.youtube.com/watch?v=6MP48RFhe2Y)

![vrm-avatar-thumbnail](https://github.com/user-attachments/assets/29e8ea14-56c0-47af-a632-55f09a571d6c)

[Demo](https://vrm.wawasensei.dev/) - [Starter Pack](https://github.com/wass08/r3f-vrm-starter)

