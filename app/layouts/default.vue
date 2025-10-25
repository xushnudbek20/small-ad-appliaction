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
      <div class="bg-white rounded-2xl mt-4 ">
        <div class="p-2">
          <UTabs color="primary" variant="link" :content="false" :items="items" :ui="{trigger:'grow'}" class="w-full" />
        </div>
      </div>
		
      <div>
        <slot />
      </div>
    </UContainer>
</template>