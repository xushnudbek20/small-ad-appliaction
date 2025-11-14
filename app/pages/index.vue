<script setup lang="ts">
import type { UniformVerificationResponse } from '~/types/liveness.types'

useSeoMeta({
  title: 'Uniform Verification - Liveness Check',
  description: 'Real-time face detection and uniform verification using MediaPipe',
})

const showResult = ref(false)
const openCamera = ref(false)
const result = ref<UniformVerificationResponse | null>(null)

const handleComplete = (verificationResult: UniformVerificationResponse) => {
  result.value = verificationResult
  showResult.value = true
}

const handleError = (error: string) => {
  console.error('Liveness check error:', error)
}

const handleReset = () => {
  showResult.value = false
  result.value = null
  window.location.reload()
}
const { isAuth } = useFilters()
const userName = computed(() => {
  const userCookie = useCookie('user').value
  return userCookie 
})
if (!isAuth.value) {
  await navigateTo('/login')
}
</script>

<template>
  <div class="min-h-screen bg-slate-950">
    <UContainer >
    <div class="text-center pt-40">
      <h1 class="text-3xl">Salomhayot KPI tizimiga xush kelibsiz, {{userName}}! </h1>
      <p class="text-slate-400 mt-5">Iltimos, quyidagi tugmani bosib, tekshiruvini boshlang.</p>

      <UModal >
        <UButton size="xl" color="primary" variant="solid" class="mt-6  text-center">
          <span class="text-2xl ">Ishga keldim</span>
        </UButton>

        <template #content>
          <div >
            <LivenessCheckLivenessCamera
              @complete="handleComplete"
              @error="handleError"
            />
          </div>
        </template>
      </UModal>
    </div>

      <!-- <div v-else class="min-h-screen flex items-center justify-center p-8">
        <UCard class="max-w-2xl w-full bg-slate-900 border border-slate-700">
          <template #header>
            <h2 class="text-2xl font-bold text-white">
              Verification Complete
            </h2>
          </template>

          <div class="space-y-6">
            <div
              :class="[
                'p-6 rounded-lg border-2',
                result?.uniformDetected
                  ? 'bg-green-900/20 border-green-500'
                  : 'bg-red-900/20 border-red-500',
              ]"
            >
              <div class="flex items-center gap-3 mb-4">
                <UIcon
                  :name="result?.uniformDetected ? 'i-heroicons-check-circle' : 'i-heroicons-x-circle'"
                  class="w-12 h-12"
                  :class="result?.uniformDetected ? 'text-green-500' : 'text-red-500'"
                />
                <div>
                  <h3 class="text-xl font-semibold text-white">
                    {{ result?.uniformDetected ? 'Uniform Detected' : 'No Uniform Detected' }}
                  </h3>
                  <p class="text-slate-300 text-sm">
                    Confidence: {{ result ? (result.confidence * 100).toFixed(1) : 0 }}%
                  </p>
                </div>
              </div>

              <p class="text-white mb-2">{{ result?.message }}</p>

              <div v-if="result?.uniformType" class="mt-4 p-3 bg-slate-800/50 rounded">
                <p class="text-sm text-slate-300">
                  <span class="font-semibold">Uniform Type:</span> {{ result.uniformType }}
                </p>
              </div>
            </div>

            <div class="space-y-3">
              <h4 class="text-lg font-semibold text-white">
                Verification Details
              </h4>
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div class="p-3 bg-slate-800 rounded">
                  <p class="text-slate-400">Status</p>
                  <p class="text-white font-semibold">
                    {{ result?.success ? 'Success' : 'Failed' }}
                  </p>
                </div>
                <div class="p-3 bg-slate-800 rounded">
                  <p class="text-slate-400">Timestamp</p>
                  <p class="text-white font-semibold">
                    {{ new Date().toLocaleTimeString() }}
                  </p>
                </div>
              </div>
            </div>

            <UButton
              block
              size="lg"
              @click="handleReset"
            >
              Start New Verification
            </UButton>
          </div>
        </UCard>
      </div> -->
    </UContainer>
  </div>
</template>
