

<script setup lang="ts">

import * as z from 'zod'
import type { FormSubmitEvent, AuthFormField } from '@nuxt/ui'
import type { Root } from '~/types/user'
const router = useRouter()
const route = useRoute()
const fields: AuthFormField[] = [{
  name: 'login',
  type: 'text',
  label: 'Login',
  placeholder: 'Login',
  required: true
}, {
  name: 'password',
  label: 'Parol',
  type: 'password',
  placeholder: 'Parol',
  required: true
}, ]

const schema = z.object({
  login: z.string('Invalid login').min(2, 'Kamida 2 ta belgidan iborat bo\'lishi kerak'),
  password: z.string('Parol is required').min(4, 'Kamida 4 ta belgidan iborat bo\'lishi kerak')
})

type Schema = z.output<typeof schema>
  const runtimeConfig = useRuntimeConfig()

async function onSubmit(payload: FormSubmitEvent<Schema>) {
    console.log('Submitted', payload)
     const res:Root = await $fetch(runtimeConfig.public.baseUrl + 'auth/login', {
      method: 'POST',
      body: payload.data,
    })
    const { access_token } = res.data
    useCookie('accessToken').value = access_token
    useCookie('user').value = JSON.stringify(res.data.user.name)
     await nextTick(() => {
      router.replace('/')
    })
}
const { isAuth } = useFilters()

if (isAuth.value) {
  await navigateTo('/')
}
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-4 p-4">
    <UPageCard class="w-full max-w-md">
      <UAuthForm
        :schema="schema"
        :fields="fields"
        title="Xush kelibsiz!"
        icon="i-lucide-lock"
        :submit="{ label: 'Kirish', block: true }"
        @submit="onSubmit"
      />
    </UPageCard>
  </div>
</template>

