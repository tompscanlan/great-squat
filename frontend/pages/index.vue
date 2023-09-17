<script setup lang="ts">
definePageMeta(
  {
    documentDriven:
    {
      page: false, // Keep page fetching enabled
      surround: false // Disable surround fetching
    }
  }
)

useHead({
  title: 'Team Order Randomizer',
  meta: [
    { name: 'description', content: 'A tool for picking among team mates in random order, for example when everyone must speak in turn, but order should be mixed in a way that does not favor a heriarchy.' }
  ],
  bodyAttrs: {
    class: ''
  }
})

function getTeamList (): string[] {
  if (team.value != null) {
    return team.value.split(/ *, */)
  } else {
    return []
  }
}

function getRandomizedTeamList (): string[] {
  return shuffle(getTeamList())
}

function shuffle (array: string[]): string[] {
  const a = Array.from(array)

  let m: number = array.length
  let t
  let i

  // While there remain elements to shuffle…
  while (m > 0) {
    // Pick a remaining element…
    i = Math.floor(Math.random() * m--)

    // And swap it with the current element.
    t = a[m]
    a[m] = a[i]
    a[i] = t
  }

  return a
}

const teamList = computed(getTeamList)

// from a cookie, load a team string or set a default team string
const team = useCookie('team')
team.value = team.value ?? 'jill, jethero, philbert, eurasmus, archie, ziggy'

// keep track of our list which has been mixed up
const teamOrdered = ref<string[]>()
teamOrdered.value = getRandomizedTeamList()

</script>

<template>
  <NuxtLayout name="default">
    <div class="w-auto content-center text-center m-5 p-5 space-y-5">
      <p>
        Put your team members' names in here, comma separated and we'll mix them up.
      </p>
      <input v-model="team" type="textarea" placeholder="sarah, tom, jill, jack" class="shadow appearance-none border rounded-lg p-2">

      <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" @click="teamOrdered = getRandomizedTeamList()">
        shuffle
      </button>

      <div class="columns-1 m-5 p-5 space-y-3">
        <!-- <p>
          Team list
          in the order you typed it
        </p>

        <div v-for="(value) in teamList" :key="value" class="">
          <span class="text-xs font-semibold px-3 py-1 rounded text-purple-600 bg-purple-200 capitalize">
            {{ value }}
          </span>
        </div> -->

        <p>
          Team listed in random order
        </p>
        <div v-for="(value) in teamOrdered" :key="value" class="">
          <span class="text-xs font-semibold px-3 py-1 rounded text-purple-600 bg-purple-200 capitalize">
            <!-- {{ index+1 }} is  -->
            {{ value }}
          </span>
        </div>
      </div>
      <a class="text-blue-600 hover:text-purple-600" href="https://docs.google.com/forms/d/e/1FAIpQLSdIc2xeP1nGFUZD_c8ajEmXsb1_CM8gTYD-iNYVqTm8T9LXMg/viewform?usp=sf_link">Feedback</a>
    </div>
  </NuxtLayout>
</template>
