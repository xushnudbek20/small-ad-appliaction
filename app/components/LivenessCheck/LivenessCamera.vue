<script setup lang="ts">
import type { UniformVerificationResponse } from '~/types/liveness.types'
import { captureImageFromVideo, compressImage, blobToDataURL } from '~/utils/imageProcessing'
import { uploadForUniformCheck } from '~/utils/apiClient'

const emit = defineEmits<{
  complete: [result: UniformVerificationResponse]
  error: [error: string]
}>()

const videoRef = ref<HTMLVideoElement>()
const capturedImageUrl = ref<string>('')
const isUploading = ref(false)
const uploadError = ref<string>('')
const verificationResult = ref<UniformVerificationResponse | null>(null)

const camera = useCamera()
const mediaPipe = useMediaPipe()
const liveness = useLivenessDetection()

const showPreview = ref(false)

let detectionInterval: number | null = null

const initializeCamera = async () => {
  try {
    const stream = await camera.startCamera()

    if (videoRef.value && stream) {
      videoRef.value.srcObject = stream

      await new Promise<void>((resolve) => {
        if (videoRef.value) {
          videoRef.value.onloadedmetadata = () => {
            videoRef.value!.play()
            resolve()
          }
        }
      })

      await mediaPipe.initialize()
      await mediaPipe.startDetection(videoRef.value)

      liveness.startDetection()

      detectionInterval = window.setInterval(() => {
        if (mediaPipe.lastDetectionResult.value && videoRef.value) {
          liveness.processDetection(
            mediaPipe.lastDetectionResult.value,
            videoRef.value.videoWidth,
            videoRef.value.videoHeight,
          )

          if (liveness.phase.value === 'capturing' && liveness.state.isLivenessCheckPassed) {
            handleCapture()
          }
        }
      }, 100)
    }
  }
  catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to initialize camera'
    emit('error', errorMessage)
  }
}

const handleCapture = async () => {
  if (!videoRef.value)
    return

  if (detectionInterval) {
    clearInterval(detectionInterval)
    detectionInterval = null
  }

  try {
    const imageBlob = await captureImageFromVideo(videoRef.value)
    const compressedBlob = await compressImage(imageBlob)
    const dataUrl = await blobToDataURL(compressedBlob)

    capturedImageUrl.value = dataUrl
    showPreview.value = true

    mediaPipe.stopDetection()
  }
  catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to capture image'
    emit('error', errorMessage)
  }
}

const handleConfirm = async () => {
  if (!capturedImageUrl.value)
    return

  isUploading.value = true
  uploadError.value = ''

  try {
    const blob = await fetch(capturedImageUrl.value).then(r => r.blob())

    const result = await uploadForUniformCheck(blob)
    verificationResult.value = result

    emit('complete', result)
  }
  catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to upload image'
    uploadError.value = errorMessage
    emit('error', errorMessage)
  }
  finally {
    isUploading.value = false
  }
}

const handleRetry = () => {
  capturedImageUrl.value = ''
  showPreview.value = false
  verificationResult.value = null
  uploadError.value = ''
  liveness.resetChecks()

  if (videoRef.value && camera.videoStream.value) {
    mediaPipe.startDetection(videoRef.value)
    liveness.startDetection()

    detectionInterval = window.setInterval(() => {
      if (mediaPipe.lastDetectionResult.value && videoRef.value) {
        liveness.processDetection(
          mediaPipe.lastDetectionResult.value,
          videoRef.value.videoWidth,
          videoRef.value.videoHeight,
        )

        if (liveness.phase.value === 'capturing' && liveness.state.isLivenessCheckPassed) {
          handleCapture()
        }
      }
    }, 100)
  }
}

onMounted(() => {
  initializeCamera()
})

onUnmounted(() => {
  if (detectionInterval) {
    clearInterval(detectionInterval)
  }
  mediaPipe.cleanup()
  camera.stopCamera()
})
</script>

<template>
  <div class="relative w-full h-screen bg-slate-950 overflow-hidden">
    <div v-if="camera.isLoading.value" class="absolute inset-0 flex items-center justify-center bg-slate-950 z-50">
      <UCard class="bg-slate-900">
        <div class="flex flex-col items-center gap-4 p-6">
          <UIcon name="i-heroicons-camera" class="w-12 h-12 text-blue-500 animate-pulse" />
          <p class="text-white text-lg">Initializing camera...</p>
        </div>
      </UCard>
    </div>

    <div v-if="camera.error.value" class="absolute inset-0 flex items-center justify-center bg-slate-950 z-50">
      <UCard class="bg-slate-900 border border-red-500/50">
        <div class="flex flex-col items-center gap-4 p-6 max-w-md">
          <UIcon name="i-heroicons-exclamation-triangle" class="w-12 h-12 text-red-500" />
          <p class="text-white text-lg font-semibold">Camera Error</p>
          <p class="text-slate-300 text-center">{{ camera.error.value }}</p>
          <UButton color="error" @click="initializeCamera">
            Try Again
          </UButton>
        </div>
      </UCard>
    </div>

    <video
      ref="videoRef"
      class="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
      :class="{ 'hidden': showPreview }"
      autoplay
      playsinline
      muted
    />

    <LivenessCheckFaceOverlay
      v-if="!showPreview"
      :is-frame-valid="liveness.state.isFrameValid"
      :face-distance="liveness.state.faceDistance"
    />

    <LivenessCheckLivenessInstructions
      v-if="!showPreview"
      :state="liveness.state"
    />

    <div v-if="showPreview" class="absolute inset-0 flex items-center justify-center bg-slate-950">
      <div class="relative max-w-4xl max-h-[90vh]">
        <img
          :src="capturedImageUrl"
          alt="Captured preview"
          class="rounded-lg shadow-2xl max-w-full max-h-[90vh] object-contain"
        >

        <div class="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4">
          <UButton
            size="lg"
            color="neutral"
            :disabled="isUploading"
            @click="handleRetry"
          >
            <UIcon name="i-heroicons-arrow-path" class="w-5 h-5 mr-2" />
            Retry
          </UButton>
          <UButton
            size="lg"
            color="primary"
            :loading="isUploading"
            @click="handleConfirm"
          >
            <UIcon name="i-heroicons-check" class="w-5 h-5 mr-2" />
            Confirm & Upload
          </UButton>
        </div>

        <div v-if="uploadError" class="absolute top-8 left-1/2 -translate-x-1/2">
          <UCard class="bg-red-900/90 border border-red-500/50">
            <p class="text-white text-sm">{{ uploadError }}</p>
          </UCard>
        </div>
      </div>
    </div>

    <div v-if="verificationResult" class="absolute top-8 right-8 z-20">
      <UCard
        :class="[
          'border-2',
          verificationResult.uniformDetected ? 'bg-green-900/90 border-green-500' : 'bg-red-900/90 border-red-500',
        ]"
      >
        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <UIcon
              :name="verificationResult.uniformDetected ? 'i-heroicons-check-circle' : 'i-heroicons-x-circle'"
              class="w-6 h-6 text-white"
            />
            <span class="text-white font-semibold">
              {{ verificationResult.uniformDetected ? 'Uniform Detected' : 'No Uniform Detected' }}
            </span>
          </div>
          <p class="text-white/80 text-sm">{{ verificationResult.message }}</p>
          <p class="text-white/60 text-xs">Confidence: {{ (verificationResult.confidence * 100).toFixed(1) }}%</p>
          <p v-if="verificationResult.uniformType" class="text-white/80 text-sm">
            Type: {{ verificationResult.uniformType }}
          </p>
        </div>
      </UCard>
    </div>
  </div>
</template>
