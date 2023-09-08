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

function resultLink(domain:string) {
    return "/results/" + domain
}
</script>

<template>
    <div>
       <!-- request: {{ request }} -->

        <!-- <span v-if="request.resolves"> -->
            domain:<NuxtLink class="text-blue-600 hover:text-pink-500 m-2" :to="resultLink(request.related_to)">{{request.related_to}}</NuxtLink>
            related_to:<NuxtLink class="text-blue-600 hover:text-pink-500" :to="resultLink(request.domain)">{{request.domain}}</NuxtLink>
            {{ Date(request.date) }}
            {{ request.resolves }}
        <!-- </span> -->

    </div>
</template>