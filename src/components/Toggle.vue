<script setup lang="ts">
  import { computed, ref } from "vue";
  
  const props = withDefaults(
    defineProps<{
      modelValue: boolean;
      label: string;
      disabled?: boolean;
    }>(),
    {
      disabled: false,
    }
  );
  
  const emit = defineEmits<{
    (e: "update:modelValue", v: boolean): void;
  }>();
  
  const isFocused = ref(false);
  const isOn = computed(() => !!props.modelValue);
  
  function setValue(v: boolean) {
    if (props.disabled) return;
    emit("update:modelValue", v);
  }
  
  function toggle() {
    setValue(!isOn.value);
  }
  
  function onKeydown(e: KeyboardEvent) {
    if (props.disabled) return;
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      toggle();
    }
  }
</script>
  
<template>
  <div class="v3toggle" :class="{ disabled: disabled, focused: isFocused, on: isOn }">
    <button
      class="track"
      type="button"
      role="switch"
      :aria-checked="isOn ? 'true' : 'false'"
      :aria-disabled="disabled ? 'true' : 'false'"
      :disabled="disabled"
      @click="toggle"
      @keydown="onKeydown"
      @focus="isFocused = true"
      @blur="isFocused = false"
    >
      <span class="thumb" aria-hidden="true" />
    </button>

    <span class="label">{{ label }}</span>
  </div>
</template>
  
<style scoped>
  .v3toggle {
    --bg: rgba(255, 255, 255, 0.06);
    --stroke: rgba(255, 255, 255, 0.14);
    --stroke2: rgba(255, 255, 255, 0.22);
    --text: rgba(255, 255, 255, 0.92);
    --muted: rgba(255, 255, 255, 0.62);
    --radius: 999px;
  
    --accent: 124 92 255;
    --accent2: 65 240 207;
  
    display: inline-flex;
    align-items: center;
    gap: 12px;
    font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial;
    color: var(--text);
  }
  
  .track {
    position: relative;
    width: 52px;
    height: 32px;
    border-radius: var(--radius);
    border: 1px solid var(--stroke);
    background: rgba(255, 255, 255, 0.08);
    cursor: pointer;
    padding: 0;
    outline: none;
    transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
  }
  
  .thumb {
    position: absolute;
    top: 50%;
    left: 4px;
    transform: translateY(-50%);
    width: 24px;
    height: 24px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.90);
    box-shadow:
      0 10px 22px rgba(0, 0, 0, 0.35),
      inset 0 1px 0 rgba(255, 255, 255, 0.25);
    transition: transform 0.18s ease, background 0.2s ease;
  }
  
  /* ON */
  .on .track {
    border-color: rgba(var(--accent), 0.55);
    background: linear-gradient(
      135deg,
      rgba(var(--accent), 0.65),
      rgba(var(--accent2), 0.45)
    );
  }
  .on .thumb {
    transform: translate(20px, -50%);
    background: rgba(255, 255, 255, 0.95);
  }
  
  /* Focus ring */
  .focused .track {
    box-shadow:
      0 0 0 4px rgba(var(--accent), 0.18),
      0 0 0 1px rgba(var(--accent), 0.45);
  }
  
  /* Disabled */
  .disabled {
    opacity: 0.55;
  }
  .disabled .track {
    cursor: not-allowed;
  }
  .disabled .thumb {
    box-shadow:
      0 6px 14px rgba(0, 0, 0, 0.25),
      inset 0 1px 0 rgba(255, 255, 255, 0.18);
  }
  
  .label {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.82);
    user-select: none;
  }
</style>  