<template>
  <div class="grid gap-4 p-4 w-full md:grid-cols-3 sm:grid-cols-2 grid-cols-1">
    <TaskBlock v-for="item in tasks" :key="item.id" :task="item" />
  </div>
</template>

<script lang="ts" setup>
import type { Task } from '~/types/task';
const tasks = ref<Task[]>([]);

const { default: tasksData } = await import('~/assets/fakeDB/tasks');
tasks.value = tasksData;
</script>