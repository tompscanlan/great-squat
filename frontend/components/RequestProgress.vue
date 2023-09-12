<template>
    <div>
        <h1 class="text-2xl"> Request Progress
        </h1>

        Domain is {{ domainStore.latest.domain }}
        Number of Permutations Generated: {{ domainStore.latest.permutations_generated }}
        
        Requests: {{ requestsStore.requests.length }}

        Results: {{ resultsStore.results.length }}

        <!-- <NuxtLink :to="requestLink(domainStore.latest.domain)" class="text-blue-600 hover:text-pink-500">Results</NuxtLink> -->

    </div>
</template>

<script setup lang="ts">
import { useDomainStore } from "../store/domain"
import { useRequestsStore} from "../store/requests"
import { useResultsStore} from "../store/results"


const domainStore = useDomainStore();
const requestsStore = useRequestsStore();
const resultsStore = useResultsStore();
const config = useRuntimeConfig()

// function requestLink(domain: string) {
//     return "/requests/" + domain
// }

onMounted(() => {
    console.log("mounted")
    requestsStore.setEndpointURL(new URL(config.public.apiUrl + "/requests"))
    requestsStore.getRequests();
    resultsStore.setEndpointURL(new URL(config.public.apiUrl + "/results"))
    resultsStore.getResults();
})

</script>