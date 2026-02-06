<script lang="ts" setup>
const q = ref("");

const { data } = await useFetch("/api", {
  query: { q },
  watch: [q],
});
</script>

<template>
  <div>
    <input type="text" v-model="q" />
    {{ data }}
  </div>
</template>
