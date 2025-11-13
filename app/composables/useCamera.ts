import type { CameraConfig } from '~/types/liveness.types'
import { cameraConfig } from '~/config/liveness.config'

export function useCamera(config: CameraConfig = cameraConfig) {
  const videoStream = ref<MediaStream | null>(null)
  const isPermissionGranted = ref(false)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const startCamera = async () => {
    isLoading.value = true
    error.value = null

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          width: { ideal: config.width },
          height: { ideal: config.height },
          facingMode: config.facingMode,
        },
        audio: false,
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      videoStream.value = stream
      isPermissionGranted.value = true
      return stream
    }
    catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to access camera'
      error.value = errorMessage

      if (errorMessage.includes('Permission denied')) {
        error.value = 'Camera permission denied. Please allow camera access and reload the page.'
      }
      else if (errorMessage.includes('not found')) {
        error.value = 'No camera found on this device.'
      }
      else {
        error.value = 'Failed to start camera. Please check your camera settings.'
      }

      throw new Error(error.value)
    }
    finally {
      isLoading.value = false
    }
  }

  const stopCamera = () => {
    if (videoStream.value) {
      videoStream.value.getTracks().forEach(track => track.stop())
      videoStream.value = null
      isPermissionGranted.value = false
    }
  }

  onUnmounted(() => {
    stopCamera()
  })

  return {
    videoStream: readonly(videoStream),
    isPermissionGranted: readonly(isPermissionGranted),
    isLoading: readonly(isLoading),
    error: readonly(error),
    startCamera,
    stopCamera,
  }
}
