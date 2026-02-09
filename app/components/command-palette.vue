<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import type { AreaDocument } from "~~/server/models/Area";

const clipboard = useClipboard();

const isOpen = defineModel<boolean>("open");
const query = defineModel<string>("query", { default: "" });
const items = defineModel<AreaDocument[]>("items", { default: [] });
const loading = defineModel<boolean>("loading");

const selectedIndex = ref(0);

// ⌨️ Gestion clavier globale
function handleGlobalKey(event: KeyboardEvent) {
  if ((event.ctrlKey || event.metaKey) && event.key === "k") {
    event.preventDefault();
    isOpen.value = !isOpen.value;
  }
}

function handleNavigation(event: KeyboardEvent) {
  if (!isOpen.value) return;

  if (event.key === "ArrowDown") {
    selectedIndex.value = (selectedIndex.value + 1) % items.value.length;

    // document
    //   .querySelector(`[data-area-index="${selectedIndex.value}"]`)
    //   ?.scrollIntoView();
  }

  if (event.key === "ArrowUp") {
    selectedIndex.value =
      (selectedIndex.value - 1 + items.value.length) % items.value.length;
  }

  if (event.key === "Enter") {
    const command = items.value[selectedIndex.value];
    // command?.action();
    closePalette();
  }

  if (event.key === "Escape") {
    closePalette();
  }
}

function closePalette() {
  isOpen.value = false;
  query.value = "";
  selectedIndex.value = 0;
}

onMounted(() => {
  window.addEventListener("keydown", handleGlobalKey);
  window.addEventListener("keydown", handleNavigation);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleGlobalKey);
  window.removeEventListener("keydown", handleNavigation);
});
</script>

<template>
  <Teleport to="body">
    <!---->
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-start justify-center pt-32 z-50"
      @click="closePalette"
    >
      <div
        class="w-full max-w-2xl bg-default rounded-md shadow-md overflow-hidden"
        @click.stop
      >
        <div class="flex items-center border-subtle border-b bg-subtle/30">
          <div class="w-15 -500 flex items-center justify-center">
            <Icon
              v-if="loading"
              name="lucide:loader-circle"
              class="opacity-30 text-2xl animate-spin"
            />

            <Icon v-else name="lucide:search" class="opacity-30 text-2xl" />
          </div>
          <!-- Input -->
          <input
            v-model="query"
            autofocus
            placeholder="Search for a city"
            class="w-full pr-5 py-5 outline-none"
          />
        </div>

        <!-- Liste -->
        <ul class="max-h-80 overflow-y-auto">
          <li
            v-for="(cmd, index) in items"
            :key="cmd.id"
            :data-area-index="index"
            :class="{ 'bg-subtle/70': selectedIndex === index }"
            class="px-7 py-5 cursor-pointer border-b border-subtle/70 hover:bg-subtle/50 flex items-center gap-2"
            @click="
              clipboard.copy(JSON.stringify(cmd)).then(() => {
                console.log('copié');
              })
            "
          >
            <Icon name="lucide:map-pin" class="opacity-50 text-xl" />

            <div>
              {{ cmd.name }}
            </div>

            <div class="text-sm ml-auto opacity-50">
              {{ cmd.fullName }}
            </div>
          </li>

          <li v-if="items.length === 0" class="px-4 py-15 text-center">
            <Icon
              name="lucide:file-search-corner"
              class="opacity-15 text-8xl"
            />
          </li>
        </ul>
      </div>
    </div>
  </Teleport>
</template>
