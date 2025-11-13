import { reactive, ref, onUnmounted } from 'vue'
import type { LivenessState, LivenessPhase, FaceDetectionResult, HeadPosition } from '~/types/liveness.types'
import { livenessCheckConfig, detectionConfig } from '~/config/liveness.config'

export function useLivenessDetection() {
  const state = reactive<LivenessState>({
    isFaceDetected: false,
    isBlinkDetected: false,
    blinkCount: 0,
    isHeadMovementDetected: false,
    headMovementLeft: false,
    headMovementRight: false,
    isStable: false,
    isLivenessCheckPassed: false,
    currentInstruction: 'Position your face in the frame',
    isFaceInFrame: false,
    isFrameValid: false,
    faceDistance: 'none',
    lighting: 'unknown',
  })

  const phase = ref<LivenessPhase>('initializing')
  const previousEyeState = ref<'open' | 'closed'>('open')
  const baseHeadPosition = ref<HeadPosition | null>(null)
  const stabilityStartTime = ref<number | null>(null)
  const blinkTimeoutId = ref<number | null>(null)

  const validateFramePosition = (detection: FaceDetectionResult, _videoWidth: number, _videoHeight: number): boolean => {
    if (!detection.boundingBox)
      return false

    const { boundingBox } = detection
    
    const isCentered = Math.abs(boundingBox.xCenter - 0.5) < 0.2

    const faceHeightRatio = boundingBox.height
    const isHeightValid = faceHeightRatio >= 0.25 && faceHeightRatio <= 0.5

    const faceTopPosition = boundingBox.yCenter - boundingBox.height / 2
    const hasHeadVisible = faceTopPosition > 0.1 && faceTopPosition < 0.3

    const faceBottomPosition = boundingBox.yCenter + boundingBox.height / 2
    const hasChestSpace = faceBottomPosition < 0.75

    return isCentered && isHeightValid && hasHeadVisible && hasChestSpace
  }

  const checkFaceDistance = (detection: FaceDetectionResult): 'too-close' | 'too-far' | 'good' => {
    if (!detection.boundingBox)
      return 'too-far'

    const faceArea = detection.boundingBox.width * detection.boundingBox.height

    if (faceArea > 0.65)
      return 'too-close'
    if (faceArea < 0.08)
      return 'too-far'
    return 'good'
  }

  const detectBlink = (detection: FaceDetectionResult): boolean => {
    if (!detection.detections || detection.detections.length === 0)
      return false

    const faceDetection = detection.detections[0] as {
      landmarks?: Array<{ x: number, y: number, z: number }>
    }
    const landmarks = faceDetection.landmarks

    if (!landmarks || landmarks.length < 6)
      return false

  // landmarks order may vary across detectors; defensively try to find eye and nose-like points
  const rightEye = landmarks[0]!
  const leftEye = landmarks[1]!
  const nose = landmarks[2]!

    const eyeDistance = Math.sqrt(
      Math.pow(rightEye.x - leftEye.x, 2) + Math.pow(rightEye.y - leftEye.y, 2),
    )

    const avgEyeToNoseY = ((rightEye.y + leftEye.y) / 2 - nose.y)
    const eyeOpenRatio = avgEyeToNoseY / eyeDistance

    const currentEyeState = eyeOpenRatio < 0.15 ? 'closed' : 'open'

    if (previousEyeState.value === 'open' && currentEyeState === 'closed') {
      previousEyeState.value = 'closed'
      return false
    }

    if (previousEyeState.value === 'closed' && currentEyeState === 'open') {
      previousEyeState.value = 'open'
      return true
    }

    previousEyeState.value = currentEyeState
    return false
  }

  const scheduleBlinkReset = () => {
    if (blinkTimeoutId.value) {
      clearTimeout(blinkTimeoutId.value)
      blinkTimeoutId.value = null
    }

    // reset isBlinkDetected after configured timeout
    blinkTimeoutId.value = window.setTimeout(() => {
      state.isBlinkDetected = false
      blinkTimeoutId.value = null
  }, livenessCheckConfig.blinkDetectionTimeoutMs ?? 1000)
  }

  const detectHeadMovement = (detection: FaceDetectionResult): { left: boolean, right: boolean } => {
    if (!detection.boundingBox || !baseHeadPosition.value) {
      if (detection.boundingBox) {
        baseHeadPosition.value = {
          x: detection.boundingBox.xCenter,
          y: detection.boundingBox.yCenter,
          rotation: 0,
        }
      }
      return { left: false, right: false }
    }

    const xDiff = detection.boundingBox.xCenter - baseHeadPosition.value.x

    const movedLeft = xDiff < -livenessCheckConfig.headMovementThreshold
    const movedRight = xDiff > livenessCheckConfig.headMovementThreshold

    return { left: movedLeft, right: movedRight }
  }

  const checkStability = (detection: FaceDetectionResult): boolean => {
    if (!detection.boundingBox)
      return false

    if (!baseHeadPosition.value) {
      baseHeadPosition.value = {
        x: detection.boundingBox.xCenter,
        y: detection.boundingBox.yCenter,
        rotation: 0,
      }
      stabilityStartTime.value = Date.now()
      return false
    }

    const xDiff = Math.abs(detection.boundingBox.xCenter - baseHeadPosition.value.x)
    const yDiff = Math.abs(detection.boundingBox.yCenter - baseHeadPosition.value.y)

    if (xDiff < 0.02 && yDiff < 0.02) {
      if (!stabilityStartTime.value) {
        stabilityStartTime.value = Date.now()
      }

      const stableTime = Date.now() - stabilityStartTime.value
  return stableTime >= (livenessCheckConfig.stabilityDurationMs ?? 1200)
    }

    stabilityStartTime.value = null
    baseHeadPosition.value = {
      x: detection.boundingBox.xCenter,
      y: detection.boundingBox.yCenter,
      rotation: 0,
    }
    return false
  }

  const processDetection = (detection: FaceDetectionResult, videoWidth: number, videoHeight: number) => {
  state.isFaceDetected = !!detection.detections && detection.detections.length > 0 && (detection.confidence ?? 0) > (detectionConfig.minDetectionConfidence ?? 0.7)

    if (!state.isFaceDetected) {
      state.currentInstruction = 'Please position your face in the frame'
      state.isFaceInFrame = false
      state.faceDistance = 'none'
      return
    }

    state.isFaceInFrame = true
    state.faceDistance = checkFaceDistance(detection)

    // Blink detection
    const blinked = detectBlink(detection)
    if (blinked) {
      state.isBlinkDetected = true
      state.blinkCount = (state.blinkCount ?? 0) + 1
      scheduleBlinkReset()
    }

    if (phase.value === 'detecting-face') {
      state.currentInstruction = 'Face detected! Preparing liveness check...'
      return
    }

    if (phase.value === 'checking-head-left') {
      const movement = detectHeadMovement(detection)
      state.currentInstruction = 'Turn your head to the right'

      if (movement.left && !state.headMovementLeft) {
        state.headMovementLeft = true
        state.isHeadMovementDetected = true
        phase.value = 'checking-position'
        state.currentInstruction = 'Great! Now position yourself in the frame'
        return
      }
    }

    if (phase.value === 'checking-position') {
      state.isFrameValid = validateFramePosition(detection, videoWidth, videoHeight)

      if (state.faceDistance === 'too-close') {
        state.currentInstruction = 'Move back - you\'re too close'
        return
      }
      if (state.faceDistance === 'too-far') {
        state.currentInstruction = 'Move closer to the camera'
        return
      }

      if (!state.isFrameValid) {
        state.currentInstruction = 'Match the outline - center face, show shoulders'
        return
      }

      // require stability before considering the check passed
      const stable = checkStability(detection)
      state.isStable = stable

      if (!stable) {
        state.currentInstruction = 'Hold still for a moment'
        return
      }

      state.isLivenessCheckPassed = true
      phase.value = 'capturing'
      state.currentInstruction = 'Perfect! Capturing...'
    }
  }

  const startDetection = () => {
    phase.value = 'detecting-face'
    state.currentInstruction = 'Looking for your face...'

    setTimeout(() => {
      if (state.isFaceDetected) {
        phase.value = 'checking-head-left'
        state.currentInstruction = 'Turn your head to the right'
        baseHeadPosition.value = null
      }
    }, 1500)
  }

  const resetChecks = () => {
    state.isFaceDetected = false
    state.isBlinkDetected = false
    state.blinkCount = 0
    state.isHeadMovementDetected = false
    state.headMovementLeft = false
    state.headMovementRight = false
    state.isStable = false
    state.isLivenessCheckPassed = false
    state.currentInstruction = 'Position your face in the frame'
    state.isFaceInFrame = false
    state.isFrameValid = false
    state.faceDistance = 'none'
    phase.value = 'initializing'
    previousEyeState.value = 'open'
    baseHeadPosition.value = null
    stabilityStartTime.value = null

    if (blinkTimeoutId.value) {
      clearTimeout(blinkTimeoutId.value)
      blinkTimeoutId.value = null
    }
  }

  onUnmounted(() => {
    if (blinkTimeoutId.value) {
      clearTimeout(blinkTimeoutId.value)
    }
  })

  return {
    state,
    phase,
    startDetection,
    processDetection,
    resetChecks,
  }
}
