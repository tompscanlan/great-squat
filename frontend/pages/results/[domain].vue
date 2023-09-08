<script setup lang="ts">
const route = useRoute()


let main = `https://1db01495zg.execute-api.us-east-1.amazonaws.com/Prod/results/${route.params.domain}`


type record = {
    domain: string,
    date: string
}

const results: Ref<record[]> = ref([]);

fetch(main)
    .then(response => response.json())
    .then(data => results.value = data);


// When accessing /posts/1, route.params.id will be 1
console.log(route.params.domain)
</script>

<template>
    <div>
        <h1>Post {{ route.params.domain }}</h1>
        <p> {{ results }} </p>
    </div>
</template>
  