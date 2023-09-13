import { defineStore } from 'pinia'

const STORAGE_KEY = 'results'

export interface ScanResult {
    domain: string,
    date: string,
    related_to: string,
    resolves: Object
}

export const useResultsStore = defineStore(STORAGE_KEY, () => {

    const results = ref<ScanResult[]>([])

    const endpointURL = ref(new URL("http://localhost:3000/results"))

    function resultsForDomain(domain: string): ScanResult[] {
        return results.value.filter((r: ScanResult) => r.domain == domain)
    }

    async function getResults(): Promise<ScanResult[]> {
        console.log("useResultsStore.getResults:", endpointURL)
        return fetch(endpointURL.value)
            .then(response => response.json())
            .then(data => results.value = data)
            .catch(error => console.log(error))

    }

    async function getLatestScanResult(domain: string): Promise<ScanResult> {
        let results = await getResults();

        let ordered_results_for_domain = results
            .sort((a: ScanResult, b: ScanResult) => { return a.date > b.date ? 1 : -1 })
            .filter((r: ScanResult) => r.domain == domain)

        return ordered_results_for_domain[0]
    }

    function setEndpointURL(url: URL) {
        endpointURL.value = url
    }

    return {
        results,
        getResults,
        setEndpointURL,
        getLatestScanResult,
        resultsForDomain,
    }
});