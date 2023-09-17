<script setup lang="ts">


useHead({
    title: 'Great Squat! - Pop a squat for a meeting with random order',
    meta: [
        { name: 'description', content: 'A tool for daily (aka standup) meetings to shake up the order of presenting. List the team member names and we will randomize the order people speak in to prevent perceptions of who is most important, and to just keep things spicy.' }
    ],
    bodyAttrs: {
        class: ''
    },
    htmlAttrs: {
        lang: 'en'
    }
})
</script>

<template>
    <div>

        <slot />


        <div>
        </div>
    </div>
</template>
  