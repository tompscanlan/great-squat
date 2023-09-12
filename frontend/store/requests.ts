import { defineStore } from 'pinia'
import { Record } from './domain';
const STORAGE_KEY = 'requests'


export const useRequestsStore = defineStore(STORAGE_KEY, () => {

    const requests = ref<Record[]>([])
    const latest_by_domain = ref<Record>({} as Record);

    var endpointURL = new URL("http://localhost:3000/requests")

    async function getRequests(): Promise<Record[]> {
        console.log("useRequestsStore.getRequests:", endpointURL)
        return fetch(endpointURL)
            .then(response => response.json())
            .then(data => requests.value = data)
            .catch(error => console.log(error))

    }

    async function getLatestScanRequest(domain: string): Promise<Record> {
        let requests = await getRequests();

        let ordered_requests_for_domain = requests
            .sort((a: Record, b: Record) => { return a.date > b.date ? 1 : -1 })
            .filter((r: Record) => r.domain == domain)

        return ordered_requests_for_domain[0]
    }

function setEndpointURL(url: URL) {
    endpointURL = url
}

return {
    requests,
    getRequests,
    setEndpointURL,
    getLatestScanRequest
}
});