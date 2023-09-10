<script setup lang="ts">
type record = {
    domain: string,
    date: string,
    related_to: string,
    resolves: Object
}

defineProps({
    domain: String,
    request: Object
})

function resultLink(domain: string) {
    return "/results/" + domain
}

function domainLink(domain: string) {
    return "https://" + domain
}
</script>

<template>
    <div>
        <!-- request: {{ request }} -->

        <div v-if="request.resolves">
        <NuxtLink class="text-blue-600 hover:text-pink-500" :to="resultLink(request.domain)">
            {{ request.domain }}
        </NuxtLink>

        <NuxtLink class="text-blue-600 hover:text-pink-500 m-2 text-xs" :to="domainLink(request.domain)" target="_blank">
link
</NuxtLink>

    
        Resolves to {{ request.resolves }}

        Last checked on {{ new Date(request.date*1).toLocaleString() }}

        </div>

    </div>
</template>