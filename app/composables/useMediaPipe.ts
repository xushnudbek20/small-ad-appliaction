import { FaceDetection, Results } from '@mediapipe/face_detection'
import { Camera } from '@mediapipe/camera_utils'
import type { FaceDetectionResult, BoundingBox } from '~/types/liveness.types'
import { detectionConfig } from '~/config/liveness.config'

export function useMediaPipe() {
  const isInitialized = ref(false)
  const isDetecting = ref(false)
  const lastDetectionResult = ref<FaceDetectionResult | null>(null)
  const error = ref<string | null>(null)

  let faceDetection: FaceDetection | null = null
  let camera: Camera | null = null
  let lastFrameTime = 0
  const frameInterval = 1000 / detectionConfig.fpsLimit

  const onResults = (results: Results) => {
    if (!results.detections || results.detections.length === 0) {
      lastDetectionResult.value = {
        detections: [],
        confidence: 0,
      }
      return
    }

    const detection = results.detections[0]
    const boundingBox = detection.boundingBox

    if (!boundingBox) {
      lastDetectionResult.value = {
        detections: [],
        confidence: 0,
      }
      return
    }

    const bbox: BoundingBox = {
      xMin: boundingBox.xMin ?? (boundingBox.xCenter - boundingBox.width / 2),
      yMin: boundingBox.yMin ?? (boundingBox.yCenter - boundingBox.height / 2),
      width: boundingBox.width,
      height: boundingBox.height,
      xCenter: boundingBox.xCenter,
      yCenter: boundingBox.yCenter,
    }

    const confidence = (detection as any).V?.[0]?.ga 
      ?? detection.score?.[0] 
      ?? (detection as any).score 
      ?? 0.7

    lastDetectionResult.value = {
      detections: results.detections,
      confidence,
      boundingBox: bbox,
    }
  }

  const initialize = async () => {
    try {
      faceDetection = new FaceDetection({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`
        },
      })

      faceDetection.setOptions({
        model: 'short',
        minDetectionConfidence: detectionConfig.minDetectionConfidence,
      })

      faceDetection.onResults(onResults)
      isInitialized.value = true
    }
    catch (err) {
      error.value = 'Failed to initialize MediaPipe Face Detection'
      console.error('MediaPipe initialization error:', err)
      throw err
    }
  }

  const startDetection = async (videoElement: HTMLVideoElement) => {
    if (!faceDetection || !isInitialized.value) {
      await initialize()
    }

    try {
      camera = new Camera(videoElement, {
        onFrame: async () => {
          const now = Date.now()
          if (now - lastFrameTime >= frameInterval && faceDetection) {
            await faceDetection.send({ image: videoElement })
            lastFrameTime = now
          }
        },
        width: 1080,
        height: 1920,
      })

      await camera.start()
      isDetecting.value = true
    }
    catch (err) {
      error.value = 'Failed to start face detection'
      console.error('Detection start error:', err)
      throw err
    }
  }

  const stopDetection = () => {
    if (camera) {
      camera.stop()
      camera = null
    }
    isDetecting.value = false
  }

  const cleanup = () => {
    stopDetection()
    if (faceDetection) {
      faceDetection.close()
      faceDetection = null
    }
    isInitialized.value = false
  }

  onUnmounted(() => {
    cleanup()
  })

  return {
    isInitialized: readonly(isInitialized),
    isDetecting: readonly(isDetecting),
    lastDetectionResult: readonly(lastDetectionResult),
    error: readonly(error),
    initialize,
    startDetection,
    stopDetection,
    cleanup,
  }
}
