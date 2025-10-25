<template>
  <div>
    <!-- filter -->
    <div class="flex justify-between gap-2 p-4">
      <UInput v-model="searchQuery" class="w-full" trailing-icon="i-lucide-search" placeholder="Search tasks..." size="md" :loading="loadingQuery" trailing />
      <UButton icon="mdi-filter-variant" size="md" color="neutral" variant="soft" />
    </div>
    <!-- tasks grid -->
    <div class="grid gap-4 p-4 w-full md:grid-cols-3 sm:grid-cols-2 grid-cols-1">
      <TaskBlock v-for="item in tasks" :key="item.id" :task="item" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Task } from '~/types/task';
const tasks = ref<Task[]>([]);
const searchQuery = ref<string>('');
const loadingQuery = ref<boolean>(false);

const { default: tasksData } = await import('~/assets/fakeDB/tasks');
tasks.value = tasksData;

const searchTasks = useDebounce((query: string) => {
  loadingQuery.value = true;
  if (!query) {
    tasks.value = tasksData;
    loadingQuery.value = false;
    return;
  }
  tasks.value = tasksData.filter(task =>
    task.title.toLowerCase().includes(query.toLowerCase()) ||
    task.name.toLowerCase().includes(query.toLowerCase()) ||
    task.category.toLowerCase().includes(query.toLowerCase()) ||
    task.address.toLowerCase().includes(query.toLowerCase())
  );
  loadingQuery.value = false;
}, 500);

watch(searchQuery, (newQuery) => {
  searchTasks(newQuery);
});
</script>