<script setup lang="ts">
import { ref } from "vue";

const props = defineProps<{
  modelValue: string;
  label: string;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", v: string): void;
}>();

const isFocused = ref(false);

function onInput(e: Event) {
  emit("update:modelValue", (e.target as HTMLTextAreaElement).value);
}
</script>
  
<template>
  <div class="v3textarea" :class="{ focused: isFocused }">
    <div class="field">
      <label class="label">
        {{ label }}
      </label>

      <textarea
        class="control"
        :value="modelValue"
        @input="onInput"
        @focus="isFocused = true"
        @blur="isFocused = false"
      />
    </div>
  </div>
</template>
  
<style scoped>
.v3textarea {
  --bg: rgba(255, 255, 255, 0.06);
  --bg2: rgba(255, 255, 255, 0.09);
  --stroke: rgba(255, 255, 255, 0.14);
  --stroke2: rgba(255, 255, 255, 0.22);
  --text: rgba(255, 255, 255, 0.92);
  --muted: rgba(255, 255, 255, 0.62);
  --radius: 14px;

  --accent: 124 92 255;
  --accent2: 65 240 207;

  width: 100%;
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial;
}

.field {
  position: relative;
  padding: 14px 12px 10px;
  background: linear-gradient(180deg, var(--bg), rgba(255, 255, 255, 0.03));
  border: 1px solid var(--stroke);
  transition: border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
}

.field:hover {
  border-color: var(--stroke2);
  background: linear-gradient(180deg, var(--bg2), rgba(255, 255, 255, 0.04));
}

.label {
  color: rgba(255, 255, 255, 0.72);
  font-size: 14px;
  pointer-events: none;
  display: inline-block;
  margin-bottom: 8px;
}

.control {
  width: 100%;
  border: 0;
  outline: none;
  background: transparent;
  color: var(--text);
  font-size: 15px;
  line-height: 1.35;
  resize: vertical;
  min-height: 110px;
  padding: 0;
}

.focused .field {
  border-color: rgba(var(--accent), 0.55);
  box-shadow:
    0 0 0 4px rgba(var(--accent), 0.18),
    0 0 0 1px rgba(var(--accent), 0.45);
}
</style>  