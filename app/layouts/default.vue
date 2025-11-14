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
     <div>
		  <LayoutHeader /> 
      <div>
        <slot />
      </div>
     </div>
</template>