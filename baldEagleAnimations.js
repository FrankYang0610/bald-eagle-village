// baldEagleAnimations.js
// Keyframe controller
// Guides how the bald eagle model moves

// Define motion by key points and corresponding flight postures
// cfg = {
//   keyframes: [
//     { position: [x,y,z] | {x,y,z}, durationSeconds, pose?: { rotationX, flap, flapMode } },
//     ...
//   ],
//   heading?: 'path' | 'fixed' (default 'path'),
//   fixedHeadingY?: number,
//   startTimeOffsetSeconds?: number
// }

import { lerp3, yawFromDelta } from './animationMath.js';

export function makeKeyframeController(config) {
  var keyframes = (config && config.keyframes) ? config.keyframes.slice() : [];
  var headingMode = (config && config.heading) || 'path';
  var fixedHeadingY = Number((config && config.fixedHeadingY) || 0);
  var startOffset = Number((config && config.startTimeOffsetSeconds) || 0);
  if (keyframes.length < 2) {
    // Edge case: insufficient keyframes to form a path (need at least 2 for interpolation)
    // Extract position from the single keyframe and return a controller that always holds at that fixed position
    var holdPositionSpec = keyframes[0] && (keyframes[0].position || keyframes[0]);
    var holdPosX = Array.isArray(holdPositionSpec) ? holdPositionSpec[0] : (holdPositionSpec && holdPositionSpec.x) || 0;
    var holdPosY = Array.isArray(holdPositionSpec) ? holdPositionSpec[1] : (holdPositionSpec && holdPositionSpec.y) || 0;
    var holdPosZ = Array.isArray(holdPositionSpec) ? holdPositionSpec[2] : (holdPositionSpec && holdPositionSpec.z) || 0;
    return function(context) {
      return { position: [holdPosX, holdPosY, holdPosZ], rotationY: fixedHeadingY, rotationX: 0 };
    };
  }
  // Build animation segments from consecutive keyframe pairs
  // Each segment interpolates from keyframe[i] to keyframe[i+1]
  // The duration for each segment is taken from the "from" keyframe's durationSeconds property
  var segments = [];
  var totalDuration = 0;
  for (var keyframeIndex = 0; keyframeIndex < keyframes.length - 1; keyframeIndex++) {
    var fromKeyframe = keyframes[keyframeIndex];
    var toKeyframe = keyframes[keyframeIndex + 1];
    var fromPositionSpec = fromKeyframe.position || fromKeyframe;
    var toPositionSpec = toKeyframe.position || toKeyframe;
    var fromX = Array.isArray(fromPositionSpec) ? fromPositionSpec[0] : fromPositionSpec.x;
    var fromY = Array.isArray(fromPositionSpec) ? fromPositionSpec[1] : fromPositionSpec.y;
    var fromZ = Array.isArray(fromPositionSpec) ? fromPositionSpec[2] : fromPositionSpec.z;
    var toX = Array.isArray(toPositionSpec) ? toPositionSpec[0] : toPositionSpec.x;
    var toY = Array.isArray(toPositionSpec) ? toPositionSpec[1] : toPositionSpec.y;
    var toZ = Array.isArray(toPositionSpec) ? toPositionSpec[2] : toPositionSpec.z;
    var segmentDurationSeconds = Math.max(0.0001, Number(fromKeyframe.durationSeconds) || 0.0001);
    segments.push({
      type: 'linear3',
      duration: segmentDurationSeconds,
      from: [Number(fromX), Number(fromY), Number(fromZ)],
      to: [Number(toX), Number(toY), Number(toZ)],
      pose: fromKeyframe.pose || null
    });
    totalDuration += segmentDurationSeconds;
  }
  if (totalDuration <= 0) totalDuration = 0.0001;
  return function(context) {
    var elapsedSeconds = (context.now - context.createdAt) + startOffset;
    if (elapsedSeconds < 0) elapsedSeconds = 0;
    else if (elapsedSeconds > totalDuration) elapsedSeconds = totalDuration - 1e-6;
    var positionX = 0, positionY = 0, positionZ = 0;
    var yawRadians = fixedHeadingY;
    var segmentStartTime = 0;
    var rotationX = 0;
    var flapOverride = null;
    var flightModeOverride = null; // 'gliding' | 'flapping'
    for (var segmentIndex = 0; segmentIndex < segments.length; segmentIndex++) {
      var segment = segments[segmentIndex];
      var segmentEndTime = segmentStartTime + segment.duration;
      if (elapsedSeconds >= segmentStartTime && elapsedSeconds < segmentEndTime) {
        var progress = segment.duration > 0 ? ((elapsedSeconds - segmentStartTime) / segment.duration) : 1;
        var interpolatedPosition = lerp3(segment.from, segment.to, progress);
        positionX = interpolatedPosition[0]; positionY = interpolatedPosition[1]; positionZ = interpolatedPosition[2];
        var deltaX = segment.to[0] - segment.from[0];
        var deltaZ = segment.to[2] - segment.from[2];
        if (headingMode === 'path') {
          if (Math.abs(deltaX) + Math.abs(deltaZ) > 1e-6) {
            yawRadians = yawFromDelta(deltaX, deltaZ);
          }
        }
        if (segment.pose) {
          if (segment.pose.rotationX != null) rotationX = segment.pose.rotationX;
          if (segment.pose.flap) flapOverride = segment.pose.flap;
          if (segment.pose.flightMode) flightModeOverride = segment.pose.flightMode;
        }
        break;
      }
      segmentStartTime = segmentEndTime;
    }
    return {
      position: [positionX, positionY, positionZ],
      rotationY: (headingMode === 'path') ? yawRadians : fixedHeadingY,
      rotationX: rotationX,
      flap: flapOverride || undefined,
      flightMode: flightModeOverride || undefined
    };
  };
}


