<script lang="ts" setup>
import CommandPalette from "~/components/command-palette.vue";
import type { AreaDocument } from "~~/server/models/Area";

const query = ref("");
const openPalette = ref(false);

const { data, status } = await useFetch<AreaDocument[]>("/api", {
  query: { q: query },
  watch: [query],
});

// watch(
//   () => data.value,
//   () => {
//     console.log(data.value);
//   }
// );
</script>

<template>
  <div class="h-screen flex items-center justify-center">
    <div
      class="max-w-2xl w-full mx-auto cursor-pointer"
      @click="openPalette = true"
    >
      <h1 class="text-center font-semibold text-4xl mb-5">
        <span class="font-black">Area</span>
        Completion
      </h1>
      <div
        class="flex items-center rounded-xl shadow border-subtle border bg-subtle/30 h-17"
      >
        <div class="w-15 -500 flex items-center justify-center">
          <Icon name="lucide:search" class="opacity-30 text-2xl" />
        </div>

        <div class="flex-1 min-w-0 w-0 leading-none">
          <div class="opacity-50 select-none truncate">Search for a city</div>
        </div>

        <div class="ml-auto flex items-center gap-1 mr-5">
          <span
            class="border border-subtle size-8 flex items-center justify-center rounded-lg bg-subtle"
          >
            <Icon name="lucide:command" class="text-xl" />
          </span>

          <span
            class="border border-subtle size-8 flex items-center justify-center rounded-lg bg-subtle font-bold"
          >
            K
          </span>
        </div>
      </div>
    </div>

    <CommandPalette
      v-model:open="openPalette"
      v-model:query="query"
      :items="data"
      :loading="status === 'pending'"
    />
  </div>
  <div class="fixed top-0 z-50 w-full py-3 px-10 flex items-center gap-5">
    <div class="flex items-center gap-1">
      <div class="opacity-50">by</div>
      <nuxt-link to="https://github.com/domutala" class="underline">
        domutala
      </nuxt-link>
    </div>

    <div class="mx-auto"></div>

    <nuxt-link to="https://github.com/domutala/area-completion#readme" c>
      Docs
    </nuxt-link>

    <nuxt-link
      to="https://github.com/domutala/area-completion"
      class="underline"
    >
      <Icon name="simple-icons:github" class="text-xl" />
    </nuxt-link>
  </div>
</template>
