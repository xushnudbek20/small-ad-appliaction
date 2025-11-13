<script setup lang="ts">
const props = defineProps<{
  isFrameValid: boolean
  faceDistance: 'too-close' | 'too-far' | 'good' | 'none'
}>()

const overlayColor = computed(() => {
  if (props.faceDistance === 'good' && props.isFrameValid) {
    return 'rgba(34, 197, 94, 0.3)'
  }
  if (props.faceDistance === 'too-close' || props.faceDistance === 'too-far') {
    return 'rgba(234, 179, 8, 0.3)'
  }
  return 'rgba(148, 163, 184, 0.3)'
})

const borderColor = computed(() => {
  if (props.faceDistance === 'good' && props.isFrameValid) {
    return 'rgb(34, 197, 94)'
  }
  if (props.faceDistance === 'too-close' || props.faceDistance === 'too-far') {
    return 'rgb(234, 179, 8)'
  }
  return 'rgb(148, 163, 184)'
})
</script>

<template>
  <div class="absolute inset-0 pointer-events-none">
    <div class="absolute inset-0 flex items-center justify-center">
      <div
        class="relative flex flex-col items-center justify-center"
        :style="{
          width: 'min(90vw, 500px)',
          height: 'min(75vh, 800px)',
        }"
      >
        <div
          class="absolute inset-0 rounded-3xl transition-all duration-300"
          :style="{
            border: `3px solid ${borderColor}`,
          }"
        />
      </div>
    </div>
  </div>
</template>
