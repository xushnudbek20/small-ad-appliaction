<template>
    <div class="bg-white rounded-2xl p-4 flex flex-col gap-4 md:w-auto w-full">
        <div class="flex justify-between">
            <!-- Avatar -->
            <div class="flex items-center flex-wrap gap-2">
                <UAvatar :src="task.avatar" />
                <span class="text-gray-500">{{task.name }}</span>
            </div>

            <!-- Priority Icons -->
            <div class="flex items-center gap-2">
                <div class="flex  gap-2 items-center bg-red-200 px-2 rounded-xl">
                    <UIcon name="mdi-flag" class="text-red-500" />
                    <span class="text-red-500 font-bold">{{ task.priority }}</span>
                </div>
                <div class="flex  gap-2 items-center bg-green-200 px-2  rounded-xl">
                    <UIcon name="mdi-star" class="text-green-500" />
                    <span class="text-green-500 font-bold">{{ task.stars }}</span>
                </div>
            </div>
        </div>

        <span class="text-xl font-bold">{{ task.title }}</span>
        
        <div class="flex flex-wrap justify-between">
            <div class="flex gap-2 text-gray-400 items-center">
                <UIcon name="mdi-account-multiple" />
                <span class="md:w-full w-1/2 truncate">{{ task.category }}</span>
            </div>
            <div class="flex gap-2 text-gray-400 items-center">
                <UIcon name="mdi-map-marker-outline" />
                <span class="">{{ task.address }}</span>
            </div>
        </div>

        <div class="flex flex-wrap justify-between">
            <div class="flex gap-2 text-gray-400 items-center">
                <UIcon name="mdi-calendar-blank-outline" />
                <span class="md:w-full w-1/2 truncate">{{ task.start_date + ' - ' + task.end_date }}</span>
            </div>
            <div class="flex gap-2 text-gray-400 items-center">
                <UIcon name="mdi-timer-sand-empty" />
                <span class="">{{ daysDifference(task.start_date, task.end_date) }} days</span>
            </div>
        </div>  
    </div>
</template>

<script lang="ts" setup>
import type { Task } from '~/types/task';
defineProps<{
    task: Task;
}>();

const daysDifference = (start: string, end: string): number => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};
</script>
