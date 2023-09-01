<script setup lang="ts">
let domain = ref("google.com")


const checkForSquatters = () => {
    console.log(domain.value)
}
</script>

<template>
    <div>
        <h1>Great Squat</h1>

        <input type="text" v-model="domain" />
        <button @click="checkForSquatters">Check for Squatters</button>
    </div>
</template>
  