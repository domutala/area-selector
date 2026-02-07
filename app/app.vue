<script lang="ts" setup>
const q = ref("");

const { data } = await useFetch<any[]>("/api", {
  query: { q },
  watch: [q],
});

watch(
  () => data.value,
  () => {
    console.log(data.value);
  }
);
</script>

<template>
  <div>
    <input type="text" v-model="q" />

    <div v-if="data">
      <div v-for="area in data" :key="area.id">
        {{ area.fullName }}
      </div>
    </div>
  </div>
</template>
