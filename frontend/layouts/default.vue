<script setup lang="ts">


useHead({
    title: 'Great Squat! - Check for domain typo squatters',
    meta: [
        { name: 'description', content: 'A tool for finding malicious or accidental domain squatters with very similar domains to your own.' }
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
        <header>
            <h1 class="text-3xl font-bold underline">
                Great Squat</h1>

            <nav>
                <ul>
                    <li class="inline">
                        <RouterLink to="/" class="hover:text-pink-600 text-blue-600 mr-2">Home</RouterLink>
                    </li>
                    <li class="inline">
                        <RouterLink to="/requests" class="hover:text-pink-600 text-blue-600 mr-2">Requests</RouterLink>
                    </li>
                    <li class="inline">
                        <RouterLink to="/results" class="hover:text-pink-600 text-blue-600 mr-2">Results</RouterLink>
                    </li>
                </ul>
            </nav>
        </header>
        <main>
            <slot />
        </main>

        
        <div>
            <a class="text-blue-600 hover:text-pink-500"
                href="https://docs.google.com/forms/d/e/1FAIpQLSdIc2xeP1nGFUZD_c8ajEmXsb1_CM8gTYD-iNYVqTm8T9LXMg/viewform?usp=sf_link">Feedback</a>
        </div>
    </div>
</template>
  