<script lang="ts" setup>
import type { TabsItem } from '@nuxt/ui'
const route = useRoute()

const currentTab = ref('/')
const items = ref<TabsItem[]>([
  {
    label: 'Tasks',
    value: '/tasks'
  },
  {
    label: 'Requests',
    value: '/requests'
  }
])
if (items.value.some(e=>e.value == route.path)){
  currentTab.value = route.path
}
watch(currentTab, (newVal) => {
  if (newVal) {
    navigateTo(newVal)
  }
})
</script>

<template>
    <UContainer >
      <div class="bg-white rounded-2xl mt-4 ">
        <div class="p-2">
          <UTabs v-model="currentTab" color="primary" variant="link" :content="false" :items="items" :ui="{trigger:'grow'}" class="w-full" />
        </div>
      </div>
		
      <div>
        <slot />
      </div>
    </UContainer>
</template>