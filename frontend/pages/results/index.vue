<script setup lang="ts">
const config = useRuntimeConfig()

var endpointURL = new URL(config.public.apiUrl + "/results")
console.log("endpointURL", endpointURL)

type record = {
    domain: string,
    date: string
}

const requests: Ref<record[]> = ref([]);

fetch(endpointURL.href)
    .then(response => response.json())
    .then(data => requests.value = data);
</script>


<template>
    <div>
        <h1 class="text-xl font-bold underline m-4">
            Results</h1>

        <ul>
            <li v-for="request in (requests as record[])" :key="request.domain + request.date">
                {{ request.domain }} {{ request }}
            </li>
        </ul>
    </div>
</template>
