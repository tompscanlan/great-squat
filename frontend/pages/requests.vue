
<script setup lang="ts">
let main = "https://0c6z8rauv6.execute-api.us-east-1.amazonaws.com/Prod/requests"

type record = {
    domain: string,
    date: string
}

const requests: Ref<record[]> = ref([]);

fetch(main)
    .then(response => response.json())
    .then(data => requests.value = data);

    // Object.assign(state, data)
</script>


<template>
    <div>
        <h1 class="text-3xl font-bold underline">
            Requests</h1>
            <p> <RouterLink to="/" >Home</RouterLink></p>
        <ul>
            <li v-for="request in (requests as  record[])" :key="request.domain + request.date">                
                {{ request.domain }}  {{  new Date(request.date * 1) }} 
            </li>
        </ul>
    </div>
</template>
