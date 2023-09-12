import { defineStore } from 'pinia'

const STORAGE_KEY = 'domain'

export interface Record {
    domain: string,
    date: string,
    permutations_generated: number
}
interface DomainState {
    domain: string,
    apiEndpoint: URL,
}

export const useDomainStore = defineStore(STORAGE_KEY, () => {

    const latest: Ref<Record> = ref({
        domain: "",
        date: "",
        permutations_generated: 0
    });
    // const apiEndpoint = ref(new URL("http://localhost:3000"))

    // function setBaseUrl(url: URL) {
    //     endpointURL.value = url
    // }

    // // async function getRequests() {
    // //     var endpointURL = new URL(config.public.apiUrl + "/requests")

    // //     var f = await fetch(endpointURL)
    // //         .then(response => response.json())
    // //         .then(data => requests.value = data);

    // //     return requests
    // // }

    // async function getLatestScanRequest(domain: string) {
    //     var ep = new URL(endpointURL + "/requests/" + domain)

    //     var result = await fetch(ep);
    //     var json = await result.json();

    //     return requests
    // }


    // return { domain, requests, setBaseUrl, checkForSquatters, getLatestScanRequest, useDomainStore, $reset }

    return {
        latest,
        //  apiEndpoint,
        // getDomain
    }
});