
<script setup lang="ts">
const config = useRuntimeConfig()

var endpointURL = new URL(config.public.apiUrl + "/requests")
console.log("endpointURL", endpointURL)

type record = {
    domain: string,
    date: string,
    permutations_generated: number,
}

const requests: Ref<record[]> = ref([]);

fetch(endpointURL)
    .then(response => response.json())
    .then(data => requests.value = data);

    // Object.assign(state, data)

function resultLink(domain: string) {
    return "/results/" + domain
}

function sortedRequests() : record[] {
    return requests.value.sort((a, b) => {
        return b.date - a.date
    })
}
</script>


<template>
    <div>
        <h1 class="text-xl font-bold underline m-4">
            Requests</h1>
        <ul>
            <li v-for="request in (sortedRequests() as  record[])" :key="request.domain + request.date">                
                <NuxtLink :to=resultLink(request.domain) class="text-blue-600 hover:text-pink-500"> {{ request.domain }} </NuxtLink>  {{ request.permutations_generated }} {{  new Date(request.date * 1).toLocaleString() }} 
            </li>
        </ul>
    </div>
</template>
