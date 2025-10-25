<template>
  <div>
    <!-- filter -->
    <div class="flex justify-between gap-2 p-4">
      <UInput v-model="searchQuery" class="w-full" trailing-icon="i-lucide-search" placeholder="Search requests..." size="md" :loading="loadingQuery" trailing />
      <UButton icon="mdi-filter-variant" size="md" color="neutral" variant="soft" />
    </div>
    <!-- requests grid -->
    <div class="grid gap-4 p-4 w-full md:grid-cols-3 sm:grid-cols-2 grid-cols-1">
      <TaskBlock v-for="item in requests" :key="item.id" :task="item" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Task } from '~/types/task';
const requests = ref<Task[]>([]);
const searchQuery = ref<string>('');
const loadingQuery = ref<boolean>(false);

const { default: requestData } = await import('~/server/requests');
requests.value = requestData;

const searchRequest = useDebounce((query: string) => {
  loadingQuery.value = true;
  if (!query) {
    requests.value = requestData;
    loadingQuery.value = false;
    return;
  }
  requests.value = requestData.filter(task =>
    task.title.toLowerCase().includes(query.toLowerCase()) ||
    task.name.toLowerCase().includes(query.toLowerCase()) ||
    task.category.toLowerCase().includes(query.toLowerCase()) ||
    task.address.toLowerCase().includes(query.toLowerCase())
  );
  loadingQuery.value = false;
}, 500);

watch(searchQuery, (newQuery) => {
  searchRequest(newQuery);
});
</script>