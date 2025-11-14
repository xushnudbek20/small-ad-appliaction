<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
const route = useRoute()
const router = useRouter()
const login  = computed(() => {
  return route.path === '/login' ? '/' : '/login'
})
const { isAuth } = useFilters()
const userName = computed(() => {
  const userCookie = useCookie('user').value
  return userCookie 
})
const logOut = () => {
  console.log(77777);
  
  useCookie('accessToken').value = null
  useCookie('user').value = null
  router.push('/login')
}

const items = ref<DropdownMenuItem[]>([
  {
    label: 'Chiqish',
    icon: 'tabler-logout',
    onSelect: logOut
  },
])
</script>

<template>
  <UHeader>
    <template #title>
        <NuxtLink class="h-6 w-auto" to="/">
          SALOMHAYOT KPI
        </NuxtLink>
    </template>


    <template #right>
      <UColorModeButton />
       <UButton
          v-if="!isAuth"
          :to="login"
          size="md" color="primary" variant="solid"
          label="Kirish"
        />

        <div v-else class="mr-2 flex items-center">

          <span class="text-sm text-white mr-4 ">{{ userName }}</span>

           <UDropdownMenu
            :items="items"
            :content="{
              align: 'start',
              side: 'bottom',
              sideOffset: 8
            }"
            :ui="{
              content: 'w-48'
            }"
          >
            <UButton
              color="neutral"
              variant="ghost"
              icon="tabler-user-circle"
            />
          </UDropdownMenu>
        </div>
    </template>
  </UHeader>
</template>
