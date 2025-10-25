<script lang="ts" setup>
import type { TabsItem } from '@nuxt/ui'

const items = ref<TabsItem[]>([
  {
    label: 'Tasks'
  },
  {
    label: 'Requests'
  }
])
</script>

<template>
    <UContainer >
      <div class="bg-white rounded-2xl mt-4 shadow-md">
        <div class="p-2">
          <UTabs color="primary" variant="link" :content="false" :items="items" :ui="{trigger:'grow'}" class="w-full" />
        </div>
        <div class="flex justify-between gap-2 p-2">
          <UInput class="w-full" trailing-icon="i-lucide-at-sign" placeholder="Enter your email" size="md" loading trailing />
          <UButton icon="mdi-filter-variant" size="md" color="neutral" variant="soft" />
        </div>
      </div>
		
      <div>
        <slot />
      </div>
    </UContainer>
</template>