// animationTimeline.js
// Timeline data of bald eagle keyframes and subtitles

export const EAGLE_B_START_OFFSET_SECONDS = 0.5;

export const EAGLE_A_KEYFRAMES = [
  // 0–7s: Flies in fog. Keeps head up.
  { position: [0, 30, 400],    durationSeconds: 7,    pose: { flightMode: 'gliding', rotationX: (2 * Math.PI / 180) } },
  { position: [40, 26, 280] },
  // 7–9s: Goes to the outside place.
  { position: [40, 26, 280],   durationSeconds: 2,    pose: { flightMode: 'flapping', rotationX: (5 * Math.PI / 180) } },
  { position: [180, 22, 40] },
  // 9–11s: Goes up.
  { position: [180, 22, 40],   durationSeconds: 1,    pose: { flightMode: 'flapping', rotationX: (6 * Math.PI / 180) } },
  { position: [60, 36, 160] },
  { position: [60, 36, 160],   durationSeconds: 1,    pose: { flightMode: 'flapping', rotationX: (7 * Math.PI / 180) } },
  { position: [0, 42, 40] },
  // 11–13s: Goes down through the center. Goes up at the back.
  { position: [0, 42, 40],     durationSeconds: 0.8,  pose: { flightMode: 'flapping', rotationX: (-10 * Math.PI / 180) } },
  { position: [0, 20, 10] },
  { position: [0, 20, 10],     durationSeconds: 0.6,  pose: { flightMode: 'flapping', rotationX: (-8 * Math.PI / 180) } },
  { position: [0, 12, 0] },
  { position: [0, 12, 0],      durationSeconds: 0.6,  pose: { flightMode: 'flapping', rotationX: (5 * Math.PI / 180) } },
  { position: [-50, 15, -60] },
  // 13–15s: Flies low.
  { position: [-50, 15, -60],  durationSeconds: 1,    pose: { flightMode: 'gliding',  rotationX: (-2 * Math.PI / 180) } },
  { position: [0, 10, -180] },
  { position: [0, 10, -180],   durationSeconds: 1,    pose: { flightMode: 'gliding',  rotationX: 0 } },
  { position: [100, 14, -80] },
  // 15–17s: Goes up to the middle.
  { position: [100, 14, -80],  durationSeconds: 1,    pose: { flightMode: 'flapping', rotationX: (5 * Math.PI / 180) } },
  { position: [40, 26, 0] },
  { position: [40, 26, 0],     durationSeconds: 1,    pose: { flightMode: 'flapping', rotationX: (5 * Math.PI / 180) } },
  { position: [0, 30, 60] },
  // 17–19s: Makes a small circle. Flies slowly.
  { position: [0, 30, 60],     durationSeconds: 0.7,  pose: { flightMode: 'gliding',  rotationX: 0 } },
  { position: [-80, 26, 40] },
  { position: [-80, 26, 40],   durationSeconds: 0.7,  pose: { flightMode: 'gliding',  rotationX: 0 } },
  { position: [-120, 24, -40] },
  { position: [-120, 24, -40], durationSeconds: 0.6,  pose: { flightMode: 'gliding',  rotationX: 0 } },
  { position: [0, 26, -100] },
  // 19–21s: Goes through again. Goes up to leave.
  { position: [0, 26, -100],   durationSeconds: 1.2,  pose: { flightMode: 'flapping', rotationX: (-9 * Math.PI / 180) } },
  { position: [0, 18, 0] },
  { position: [0, 18, 0],      durationSeconds: 0.8,  pose: { flightMode: 'flapping', rotationX: (6 * Math.PI / 180) } },
  { position: [60, 32, 40] },
  // 21–28s: Keeps following.
  { position: [60, 32, 40],    durationSeconds: 1,    pose: { flightMode: 'gliding',  rotationX: 0 } },
  { position: [20, 28, -40] },
  { position: [20, 28, -40],   durationSeconds: 1,    pose: { flightMode: 'gliding',  rotationX: 0 } },
  { position: [0, 24, -120] },
  { position: [0, 24, -120],   durationSeconds: 0.9,  pose: { flightMode: 'flapping', rotationX: (-9 * Math.PI / 180) } },
  { position: [0, 16, 0] },
  { position: [0, 16, 0],      durationSeconds: 0.8,  pose: { flightMode: 'flapping', rotationX: (6 * Math.PI / 180) } },
  { position: [-60, 22, 60] },
  { position: [-60, 22, 60],   durationSeconds: 1,    pose: { flightMode: 'flapping', rotationX: (5 * Math.PI / 180) } },
  { position: [0, 30, 80] },
  { position: [0, 30, 80],     durationSeconds: 1,    pose: { flightMode: 'gliding',  rotationX: 0 } },
  { position: [40, 28, 40] },
  { position: [40, 28, 40],    durationSeconds: 0.5,  pose: { flightMode: 'flapping', rotationX: (2 * Math.PI / 180) } },
  { position: [-20, 24, -200] },
  // 28–30s: Flies away.
  { position: [-20, 24, -200], durationSeconds: 1.2,  pose: { flightMode: 'gliding',  rotationX: 0 } },
  { position: [-20, 24, -320] },
  { position: [-20, 24, -320], durationSeconds: 0.8,  pose: { flightMode: 'gliding',  rotationX: 0 } },
  { position: [-20, 24, -380], durationSeconds: 0 }
];

export const EAGLE_B_KEYFRAMES = [
  // 0–7s: Flies in fog.
  { position: [-20, 34, 420],  durationSeconds: 7,    pose: { flightMode: 'gliding',  rotationX: (2 * Math.PI / 180) } },
  { position: [10, 28, 300] },
  // 7–9s: Goes to the inside place.
  { position: [10, 28, 300],   durationSeconds: 2,    pose: { flightMode: 'flapping', rotationX: (5 * Math.PI / 180) } },
  { position: [150, 24, 60] },
  // 9–11s: Goes up.
  { position: [150, 24, 60],   durationSeconds: 1,    pose: { flightMode: 'flapping', rotationX: (5 * Math.PI / 180) } },
  { position: [40, 34, 150] },
  { position: [40, 34, 150],   durationSeconds: 1,    pose: { flightMode: 'flapping', rotationX: (6 * Math.PI / 180) } },
  { position: [0, 38, 60] },
  // 11–13s: Goes down fast.
  { position: [0, 38, 60],     durationSeconds: 1,    pose: { flightMode: 'flapping', rotationX: (-12 * Math.PI / 180) } },
  { position: [0, 18, 15] },
  { position: [0, 18, 15],     durationSeconds: 1,    pose: { flightMode: 'flapping', rotationX: (-9 * Math.PI / 180) } },
  { position: [-20, 14, -20] },
  // 13–15s: Flies low inside.
  { position: [-20, 14, -20],  durationSeconds: 1,    pose: { flightMode: 'gliding',  rotationX: (-2 * Math.PI / 180) } },
  { position: [0, 9, -160] },
  { position: [0, 9, -160],    durationSeconds: 1,    pose: { flightMode: 'gliding',  rotationX: 0 } },
  { position: [80, 13, -60] },
  // 15–17s: Goes up to the middle.
  { position: [80, 13, -60],   durationSeconds: 1,    pose: { flightMode: 'flapping', rotationX: (5 * Math.PI / 180) } },
  { position: [20, 24, -10] },
  { position: [20, 24, -10],   durationSeconds: 1,    pose: { flightMode: 'flapping', rotationX: (5 * Math.PI / 180) } },
  { position: [0, 28, 50] },
  // 17–19s: Makes a small inside circle. Flies slowly.
  { position: [0, 28, 50],     durationSeconds: 0.7,  pose: { flightMode: 'gliding',  rotationX: 0 } },
  { position: [-60, 25, 30] },
  { position: [-60, 25, 30],   durationSeconds: 0.7,  pose: { flightMode: 'gliding',  rotationX: 0 } },
  { position: [-100, 24, -30] },
  { position: [-100, 24, -30], durationSeconds: 0.6,  pose: { flightMode: 'gliding',  rotationX: 0 } },
  { position: [0, 25, -90] },
  // 19–21s: Goes through again. Goes up.
  { position: [0, 25, -90],    durationSeconds: 1.2,  pose: { flightMode: 'flapping', rotationX: (-10 * Math.PI / 180) } },
  { position: [0, 17, 0] },
  { position: [0, 17, 0],      durationSeconds: 0.8,  pose: { flightMode: 'flapping', rotationX: (6 * Math.PI / 180) } },
  { position: [40, 30, 50] },
  // 21–28s: Keeps following.
  { position: [40, 30, 50],    durationSeconds: 1,    pose: { flightMode: 'gliding',  rotationX: 0 } },
  { position: [10, 26, -30] },
  { position: [10, 26, -30],   durationSeconds: 1,    pose: { flightMode: 'gliding',  rotationX: 0 } },
  { position: [0, 24, -110] },
  { position: [0, 24, -110],   durationSeconds: 0.9,  pose: { flightMode: 'flapping', rotationX: (-10 * Math.PI / 180) } },
  { position: [0, 15, 0] },
  { position: [0, 15, 0],      durationSeconds: 0.8,  pose: { flightMode: 'flapping', rotationX: (6 * Math.PI / 180) } },
  { position: [20, 26, 60] },
  { position: [20, 26, 60],    durationSeconds: 1,    pose: { flightMode: 'flapping', rotationX: (5 * Math.PI / 180) } },
  { position: [0, 28, 70] },
  { position: [0, 28, 70],     durationSeconds: 1,    pose: { flightMode: 'gliding',  rotationX: 0 } },
  { position: [10, 26, 30] },
  { position: [10, 26, 30],    durationSeconds: 0.5,  pose: { flightMode: 'flapping', rotationX: (2 * Math.PI / 180) } },
  { position: [20, 24, -200] },
  // 28–30s: Flies away.
  { position: [20, 24, -200],  durationSeconds: 1.2,  pose: { flightMode: 'gliding',  rotationX: 0 } },
  { position: [20, 24, -320] },
  { position: [20, 24, -320],  durationSeconds: 0.8,  pose: { flightMode: 'gliding',  rotationX: 0 } },
  { position: [20, 24, -380],  durationSeconds: 0 }
];

// Story subtitles
export const STORY_SUBTITLE_SEGMENTS = [
  { start: 0,  end: 7,  text: 'Two bald eagles glide in the fog' },
  { start: 7,  end: 9,  text: 'As the fog clears, two bald eagles spot each other and begin to chase' },
  { start: 9,  end: 12, text: 'The two bald eagles continue the chase' },
  { start: 12, end: 18, text: 'The sun rises' },
  { start: 18, end: 26, text: 'The two bald eagles continue the chase' },
  { start: 26, end: 30, text: 'The two bald eagles are tired and fly away' },
  { start: 30, end: 35, text: 'The village returns to peace' }
];


