
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

// Object.assign(state, data)

useHead({
    title: 'Great Squat! - All Results',
    meta: [
        { name: 'description', content: 'A tool for finding malicious or accidental domain squatters with very similar domains to your own.' }
    ],
    bodyAttrs: {
        class: ''
    }
})
</script>


<template>
    <div>
        <h1 class="text-3xl font-bold underline">
            Results</h1>
        <p>
            <RouterLink to="/">Home</RouterLink>
        </p>
        <ul>
            <li v-for="request in (requests as record[])" :key="request.domain + request.date">
                {{ request.domain }} {{ request }}
            </li>
        </ul>
    </div>
</template>
