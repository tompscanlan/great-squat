
<script setup lang="ts">
let main = "https://1db01495zg.execute-api.us-east-1.amazonaws.com/Prod/results"

type record = {
    domain: string,
    date: string
}

const requests: Ref<record[]> = ref([]);

fetch(main)
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
