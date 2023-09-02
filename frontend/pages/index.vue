<script setup lang="ts">
let domain = ref("google.com")

let main = "https://d2p8slxd0v7cuy.cloudfront.net/"

const checkForSquatters = () => {
    console.log("checking for squaters at ", domain.value)
    // Simple POST request with a JSON body using fetch
const requestOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ domain: domain.value })
};
fetch(main, requestOptions)
    .then(response => response.json())
    .then(data => domain.value = data);

}


</script>

<template>
    <div class="m-4">
        <h1 class="text-3xl font-bold underline">
                Great Squat</h1>
                
            <p>
                Someone is squatting on your domain name! Or are they?
            </p>

            <p>
                We'll never know... unless we check. And that's why great squat is here.

                Give us a domain name, and we'll check to see what squatters might be out there.

            </p>
    
    <form class="w-full max-w-sm mt-4">
        <div class="md:flex md:items-center mb-6">
            <div class="md:w-1/3">
                <label class="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4" for="inline-full-name">
                    Domain to Scan
                </label>
            </div>
            <div class="md:w-2/3">
                <input 
                v-model="domain"
                    class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
                    id="inline-full-name" type="text">
            </div>
        </div>

        <div class="md:flex md:items-center">
            <div class="md:w-1/3"></div>
            <div class="md:w-2/3">
                <button
                @click="checkForSquatters"
                    class="shadow bg-purple-500 hover:bg-purple-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded"
                    type="button">
                    Scan
                                </button>
            </div>
        </div>
    </form>
</div>
</template>
  
  <!-- 
    

    <form class="w-full max-w-xs">
        <div class="md:flex md:items-center mb-6">

       


            <div class="md:w-1/3">
                <label class="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4" for="inline-full-name">
                    Domain to Scan
                </label>
            </div>
            <div class="md:w-2/3">
                <input v-model="domain"
                    class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
                    id="inline-full-name" type="text" />
            </div>

            <input type="text" v-model="domain" />
            <button @click="checkForSquatters">Check for Squatters</button>



   -->