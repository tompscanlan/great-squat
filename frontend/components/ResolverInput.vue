<template>
    <div>
        <form class="w-full max-w-sm mt-4">
            <div class="md:flex md:items-center mb-6">
                <div class="md:w-1/3">
                    <label class="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4" for="inline-full-name">
                        Domain to Scan
                    </label>
                </div>
                <div class="md:w-2/3">
                    <input v-model="domainStore.latest.domain"
                        class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
                        id="inline-full-name" type="text">
                </div>
            </div>

            <div class="md:flex md:items-center">
                <div class="md:w-1/3"></div>
                <div class="md:w-2/3">
                    <button @click="checkForSquatters"
                        class="shadow bg-purple-500 hover:bg-purple-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded"
                        type="button">
                        Scan
                    </button>
                </div>
            </div>

        </form>
    </div>
</template>


<script setup lang="ts">
import {useDomainStore, Record} from "../store/domain"

const domainStore = useDomainStore();
const config = useRuntimeConfig()

var endpointURL = new URL(config.public.apiUrl)
console.log("endpointURL", endpointURL)

var response = ref({} as Record)


function resultLink(domain: string) {
    return "/results/" + domain
}

    const checkForSquatters = async () => {
        console.log("checking for squatters at ", domainStore.latest.domain)
        // Simple POST request with a JSON body using fetch
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ domain: domainStore.latest.domain })
        };

        fetch(endpointURL, requestOptions)
            .then(response => {response.json(); console.log("response", response)})
            .then(data => response.value = JSON.parse(data));
        
    }

</script>
