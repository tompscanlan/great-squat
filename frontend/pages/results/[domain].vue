<script setup lang="ts">
const route = useRoute()
const config = useRuntimeConfig()

var endpointURL = new URL(config.public.apiUrl + `/results/${route.params.domain}`)
console.log("endpointURL", endpointURL)

type record = {
    domain: string,
    date: string
}

const results: Ref<record[]> = ref([]);

fetch(endpointURL)
    .then(response => response.json())
    .then(data => results.value = data);

</script>

<template>
    <div>
        <h1>Results for {{ route.params.domain }}</h1>
        {{ results }}
          <div>
            <ul>
                <li v-for="result in (results as record[])" :key="result.domain + result.date">
                  <ResultOutput :domain="result.domain" :request="result"></ResultOutput>
                </li>
            </ul>
        </div>
    </div>
</template>
  